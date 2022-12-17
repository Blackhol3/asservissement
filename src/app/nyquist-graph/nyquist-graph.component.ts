import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator, GainMargin, PhaseMargin } from '../frequential-response-calculator';
import * as Chart from '../chart';
import * as deepmerge from 'deepmerge';
import * as Highcharts from 'highcharts';

enum Data {
	Real,
	StabilityMargins,
}

@Component({
	selector: 'app-nyquist-graph',
	templateUrl: './nyquist-graph.component.html',
	styleUrls: ['./nyquist-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NyquistGraphComponent implements OnChanges, AfterViewInit {
	@Input() transferFunction: TransferFunction = new TransferFunction();
	frequentialResponseCalculator: FrequentialResponseCalculator = new FrequentialResponseCalculator();
	
	@ViewChild('chartElement') chartElement: ElementRef<HTMLDivElement> | undefined;
	chart: Highcharts.Chart | undefined;
	stabilityMarginsGroup: Highcharts.SVGElement | undefined = undefined;

	wMin: number = 1e-3;
	wMax: number = 1e3;
	
	options: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'scatter',
				name: 'Réponse',
				color: Chart.colors[1],
				lineWidth: 2,
				turboThreshold: 0,
			},
			{
				data: [[0, 0]],
				type: 'line',
				name: 'Marges de stabilité',
				color: Chart.colors[2],
				enableMouseTracking: false,
				marker: {
					enabled: true,
					symbol: 'plus',
					lineColor: undefined,
					lineWidth: 2,
				},
				visible: false
			},
		],
		xAxis: {
			title: {text : 'Partie réelle'},
			events: {
				afterSetExtremes: () => this.update(false),
			},
		},
		yAxis: {
			title: {text : 'Partie imaginaire'},
			crosshair: true,
		},
		plotOptions: {
			series: {
				events : {
					legendItemClick: (event: Highcharts.SeriesLegendItemClickEventObject) => {
						event.target.setVisible(undefined, false);
						this.update();
						event.preventDefault();
					},
				},
				lineWidth: 2,
			},
		},
		tooltip: {
			formatter: function() {
				const formatter = new Intl.NumberFormat(undefined, {
					minimumSignificantDigits: 3,
					maximumSignificantDigits: 3,
				});

				return [
					`<span style="color:${this.point.color}">\u25CF</span> <span style="font-size:10px;">${this.series.name}</span>`,
					`Pulsation : <b>${Chart.formatFrequency((this.point as any).w)}</b>`,
					`Réel : <b>${formatter.format(this.x as number)}</b>`,
					`Imaginaire : <b>${formatter.format(this.y as number)}</b>`,
				].join('<br />');
			},
		},
	};
	
	constructor() {}
	
	ngAfterViewInit(): void {
		this.chart = Highcharts.chart(this.chartElement!.nativeElement, deepmerge.all([Chart.options, this.options]));
		this.update();
		new ResizeObserver(() => {
			this.updateAxes();
			this.chart!.reflow();
		}).observe(this.chartElement!.nativeElement);
	}
	
	update(animate = true, nbPoints = 1001): void {
		if (this.chart === undefined) {
			return;
		}
		
		const response = this.frequentialResponseCalculator.getCartesianResponse(this.wMin, this.wMax, nbPoints);
		this.setLineData(Data.Real, response.reals, response.imaginaries, response.ws);

		this.chart.removeAnnotation('Marge de gain');
		this.chart.removeAnnotation('Marge de phase');
		this.stabilityMarginsGroup?.destroy();
		this.stabilityMarginsGroup = undefined;
		if (this.chart.series[Data.StabilityMargins].visible) {
			this.stabilityMarginsGroup = this.chart.renderer.g().add();

			const clipRectangle = this.chart.renderer.clipRect(this.chart.plotLeft, this.chart.plotTop, this.chart.plotWidth, this.chart.plotHeight);
			this.stabilityMarginsGroup.clip(clipRectangle);

			const radius = this.chart.xAxis[0].toPixels(1, false) - this.chart.xAxis[0].toPixels(0, false);
			this.chart.renderer.circle(
				this.chart.xAxis[0].toPixels(0, false),
				this.chart.yAxis[0].toPixels(0, false),
				radius,
			).attr({
				fill: 'none',
				stroke: Chart.colors[2],
				'stroke-width': 1,
				'stroke-dasharray': [8, 3, 1, 3].join(','),
			}).add(this.stabilityMarginsGroup);

			const polarResponse = this.frequentialResponseCalculator.getPolarResponse(this.wMin, this.wMax, nbPoints);
			this.addGainMarginAnnotation(this.frequentialResponseCalculator.getGainMargin(polarResponse));
			this.addPhaseMarginAnnotation(this.frequentialResponseCalculator.getPhaseMargin(polarResponse));
		}

		this.chart.redraw(animate);
	}

	addGainMarginAnnotation(gainMargin: GainMargin): void {
		if (gainMargin === null) {
			return;
		}

		const realValue = -Math.pow(10, gainMargin.gain/20);

		this.chart!.addAnnotation({
			id: 'Marge de gain',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: Chart.colors[2],
				fill: Chart.colors[2],
			},
			shapes: [
				{
					strokeWidth: 3,
					points: [
						{x: -1, y: 0, xAxis: 0, yAxis: 0},
						{x: realValue, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					points: [
						{x: -1, y: 0, xAxis: 0, yAxis: 0},
						{x: realValue, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: (realValue - 1)/2, y: 0, xAxis: 0, yAxis: 0},
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(-gainMargin.gain) + ' dB',
				align: 'center',
				verticalAlign: -gainMargin.gain > 0 ? 'bottom' : 'top',
				x: 0,
				y: -gainMargin.gain > 0 ? -10 : 10,
			}],
		});
	}

	addPhaseMarginAnnotation(phaseMargin: PhaseMargin): void {
		if (phaseMargin === null || this.chart === undefined) {
			return;
		}

		const radius = this.chart.xAxis[0].toPixels(1, false) - this.chart.xAxis[0].toPixels(0, false);
		const phaseRadians = phaseMargin.phase * Math.PI/180;

		this.chart.renderer.path([
			'M', this.chart.xAxis[0].toPixels(-1, false), this.chart.yAxis[0].toPixels(0, false),
			'A',
				radius, radius,
				0, Math.abs(phaseMargin.phase + 180) % 360 > 180 ? 1 : 0, phaseMargin.phase + 180 > 0 ? 0 : 1,
				this.chart.xAxis[0].toPixels(Math.cos(phaseRadians), false), this.chart.yAxis[0].toPixels(Math.sin(phaseRadians), false),
		] as const).attr({
			fill: 'none',
			stroke: Chart.colors[2],
			'stroke-width': 3,
		}).add(this.stabilityMarginsGroup);

		this.chart.addAnnotation({
			id: 'Marge de phase',
			draggable: '',
			shapes: [{
				type: 'path',
				stroke: Chart.colors[2],
				fill: Chart.colors[2],
				points: [
					{x: Math.cos(phaseRadians * (phaseMargin.phase + 180 > 0 ? 1.001 : 0.999)), y: Math.sin(phaseRadians * (phaseMargin.phase + 180 > 0 ? 1.001 : 0.999)), xAxis: 0, yAxis: 0},
					{x: Math.cos(phaseRadians), y: Math.sin(phaseRadians), xAxis: 0, yAxis: 0},
				],
				markerEnd: 'arrow'
			}],
			labels: [{
				point: {x: Math.cos(((phaseMargin.phase + 180) % 360 / 2 + 180) * Math.PI/180), y: Math.sin(((phaseMargin.phase + 180) % 360 / 2 + 180) * Math.PI/180), xAxis: 0, yAxis: 0},
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(phaseMargin.phase + 180) + ' °',
				align: 'right',
				verticalAlign: 'middle',
				x: -10,
				y: 0,
			}],
		});
	}
	
	updateAxes(): void {
		if (this.chart === undefined) {
			return;
		}

		const axis = {
			x: this.chart.xAxis[0],
			y: this.chart.yAxis[0],
		};
		
		const lengthInPixels = {
			x: Math.abs(axis.x.toPixels(axis.x.max ?? 0, false) - axis.x.toPixels(axis.x.min ?? 0, false)),
			y: Math.abs(axis.y.toPixels(axis.y.max ?? 0, false) - axis.y.toPixels(axis.y.min ?? 0, false)),
		};
		
		const lengthInUnits = {
			x: Math.abs((axis.x.max ?? 0) - (axis.x.min ?? 0)),
			y: Math.abs((axis.y.max ?? 0) - (axis.y.min ?? 0)),
		};
		
		const pixelsPerUnit = {
			x: lengthInPixels.x / lengthInUnits.x,
			y: lengthInPixels.y / lengthInUnits.y,
		};
		
		const midInUnits = {
			x: (axis.x.min ?? 0) + lengthInUnits.x / 2,
			y: (axis.y.min ?? 0) + lengthInUnits.y / 2,
		};
		
		const ratioXY = pixelsPerUnit.x / pixelsPerUnit.y;
		const ratioYX = 1 / ratioXY;
		
		// Marge de sécurité de 2% pour éviter une boucle infinie due aux arrondies
		if (ratioXY > 1.02) {
			axis.x.setExtremes(
				midInUnits.x - ratioXY * lengthInUnits.x / 2,
				midInUnits.x + ratioXY * lengthInUnits.x / 2,
				true,
				false,
			);
		}
		
		if (ratioYX > 1.02) {
			axis.y.setExtremes(
				midInUnits.y - ratioYX * lengthInUnits.y / 2,
				midInUnits.y + ratioYX * lengthInUnits.y / 2,
				true,
				false,
			);
		}
	}
	
	setLineData(dataType: Data, x: number[], y: number[], w: number[]): void {
		if (this.chart!.series[dataType].visible) {
			this.chart!.series[dataType].setData(x.map((_, index) => ({x: x[index], y: y[index], w: w[index]})), false);
		}
	}
	
	ngOnChanges() {
		this.frequentialResponseCalculator = new FrequentialResponseCalculator(this.transferFunction);
		this.update();
		this.updateAxes();
	}
}
