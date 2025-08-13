import { Component, ChangeDetectionStrategy, ElementRef, computed, effect, input } from '@angular/core';

import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { SeriesType } from '../common-type';
import { GraphOptions } from '../graph-options';
import { StateService } from '../state.service';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator, type GainMargin, type PhaseMargin } from '../frequential-response-calculator';
import * as Chart from '../chart';

const formatter = new Intl.NumberFormat(undefined, {
	minimumSignificantDigits: 3,
	maximumSignificantDigits: 3,
});

const marginFormatter = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	signDisplay: 'always',
});

@Component({
	selector: 'app-nyquist-graph',
	templateUrl: './nyquist-graph.component.html',
	styleUrls: ['./nyquist-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NyquistGraphComponent {
	readonly transferFunction = input.required<TransferFunction>();
	readonly graphOptions = input.required<GraphOptions>();
	readonly frequentialResponseCalculator = computed(() => new FrequentialResponseCalculator(this.transferFunction()));
	
	readonly chart: Highcharts.Chart;
	stabilityMarginsGroup: Highcharts.SVGElement | undefined = undefined;

	readonly wMin: number = 1e-3;
	readonly wMax: number = 1e3;
	
	readonly options: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'scatter',
				name: 'Réponse',
				id: SeriesType.Real,
				turboThreshold: 0,
				lineWidth: 2,
			},
			{
				data: [[0, 0]],
				type: 'line',
				name: 'Marges de stabilité',
				id: SeriesType.StabilityMargins,
				enableMouseTracking: false,
				marker: {
					enabled: true,
					symbol: 'plus',
				},
				visible: false,
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
		legend: {
			events: {
				itemClick: event => {
					this.state.toggleSeriesVisibility(this.graphOptions(), (event.legendItem as Highcharts.Series).options.id as SeriesType);
					event.preventDefault(); // eslint-disable-line @typescript-eslint/no-unsafe-call
				},
			},
		},
		tooltip: {
			formatter: function() {
				return [
					`<span class="highcharts-color-${this.colorIndex}">\u25CF</span> <span style="font-size:10px;">${this.series.name}</span>`,
					`Pulsation : <b>${Chart.formatFrequency((this as any).w)}</b>`, // eslint-disable-line
					`Réel : <b>${formatter.format(this.x)}</b>`,
					`Imaginaire : <b>${formatter.format(this.y!)}</b>`,
				].join('<br />');
			},
		},
		chart: {
			reflow: false,
		},
	};
	
	constructor(
		private readonly chartElement: ElementRef<HTMLElement>,
		private readonly state: StateService,
	) {
		const element = this.chartElement.nativeElement;
		this.chart = Highcharts.chart(element, Highcharts.merge(Chart.options, this.options));
		new ResizeObserver(() => {
			this.chart.reflow();
			this.updateAxes();
		}).observe(element);
		effect(() => {
			this.update();
			this.updateAxes();
		});
	}

	update(animate = true, nbPoints = 1001): void {
		this.state.projectionMode();

		const visibleSeries = this.graphOptions().visibleSeries;
		for (const type of this.options.series!.map(x => x.id).filter(id => id !== undefined) as SeriesType[]) {
			this.getSeries(type).setVisible(visibleSeries.has(type), false);
		}

		const response = this.frequentialResponseCalculator().getCartesianResponse(this.wMin, this.wMax, nbPoints);
		this.setLineData(SeriesType.Real, response.reals, response.imaginaries, response.ws);

		this.chart.removeAnnotation('Marge de gain');
		this.chart.removeAnnotation('Marge de phase');
		this.stabilityMarginsGroup?.destroy();
		this.stabilityMarginsGroup = undefined;
		if (this.getSeries(SeriesType.StabilityMargins).visible) {
			this.stabilityMarginsGroup = this.chart.renderer.g('annotation-shapes').add();

			const clipRectangle = this.chart.renderer.clipRect(this.chart.plotLeft, this.chart.plotTop, this.chart.plotWidth, this.chart.plotHeight);
			this.stabilityMarginsGroup.clip(clipRectangle);

			const radius = this.chart.xAxis[0].toPixels(1, false) - this.chart.xAxis[0].toPixels(0, false);
			this.chart.renderer.circle(
				this.chart.xAxis[0].toPixels(0, false),
				this.chart.yAxis[0].toPixels(0, false),
				radius,
			).addClass('line').add(this.stabilityMarginsGroup);

			const polarResponse = this.frequentialResponseCalculator().getPolarResponse(this.wMin, this.wMax, nbPoints);
			this.addGainMarginAnnotation(this.frequentialResponseCalculator().getGainMargin(polarResponse));
			this.addPhaseMarginAnnotation(this.frequentialResponseCalculator().getPhaseMargin(polarResponse));
		}

		this.chart.redraw(animate);
	}

	addGainMarginAnnotation(gainMargin: GainMargin): void {
		if (gainMargin === null) {
			return;
		}

		const realValue = -Math.pow(10, gainMargin.gain/20);

		this.chart.addAnnotation({
			id: 'Marge de gain',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: 'context-stroke',
				fill: 'context-fill',
			},
			shapes: [
				{
					className: 'arrow-line',
					points: [
						{x: -1, y: 0, xAxis: 0, yAxis: 0},
						{x: realValue, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					className: 'arrow-head',
					points: [
						{x: -1, y: 0, xAxis: 0, yAxis: 0},
						{x: realValue, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: (realValue - 1)/2, y: 0, xAxis: 0, yAxis: 0},
				text: marginFormatter.format(-gainMargin.gain) + ' dB',
				align: 'center',
				verticalAlign: -gainMargin.gain > 0 ? 'bottom' : 'top',
				x: 0,
				y: -gainMargin.gain > 0 ? -10 : 10,
			}],
		});
	}

	addPhaseMarginAnnotation(phaseMargin: PhaseMargin): void {
		if (phaseMargin === null) {
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
		] as const).addClass('arrow-line').add(this.stabilityMarginsGroup);

		this.chart.addAnnotation({
			id: 'Marge de phase',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: 'context-stroke',
				fill: 'context-fill',
			},
			shapes: [{
				className: 'arrow-head',
				points: [
					{x: Math.cos(phaseRadians * (phaseMargin.phase + 180 > 0 ? 1.001 : 0.999)), y: Math.sin(phaseRadians * (phaseMargin.phase + 180 > 0 ? 1.001 : 0.999)), xAxis: 0, yAxis: 0},
					{x: Math.cos(phaseRadians), y: Math.sin(phaseRadians), xAxis: 0, yAxis: 0},
				],
				markerEnd: 'arrow'
			}],
			labels: [{
				point: {x: Math.cos(((phaseMargin.phase + 180) % 360 / 2 + 180) * Math.PI/180), y: Math.sin(((phaseMargin.phase + 180) % 360 / 2 + 180) * Math.PI/180), xAxis: 0, yAxis: 0},
				text: marginFormatter.format(phaseMargin.phase + 180) + ' °',
				align: 'right',
				verticalAlign: 'middle',
				x: -10,
				y: 0,
			}],
		});
	}
	
	updateAxes(): void {
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
	
	setLineData(type: SeriesType, x: number[], y: number[], w: number[]): void {
		const series = this.getSeries(type);
		if (series.visible) {
			series.setData(x.map((_, index) => ({x: x[index], y: y[index], w: w[index]})), false);
		}
	}

	protected getSeries(type: SeriesType) {
		return this.chart.get(type) as Highcharts.Series;
	}
}
