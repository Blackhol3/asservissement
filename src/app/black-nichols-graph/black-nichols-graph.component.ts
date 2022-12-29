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
	selector: 'app-black-nichols-graph',
	templateUrl: './black-nichols-graph.component.html',
	styleUrls: ['./black-nichols-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlackNicholsGraphComponent implements OnChanges, AfterViewInit {
	@Input() transferFunction: TransferFunction = new TransferFunction();
	frequentialResponseCalculator: FrequentialResponseCalculator = new FrequentialResponseCalculator();
	
	@ViewChild('chartElement') chartElement: ElementRef<HTMLDivElement> | undefined;
	chart: Highcharts.Chart | undefined;
	
	wMin: number = 1e-3;
	wMax: number = 1e3;
	
	options: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'scatter',
				name: 'Réponse',
				color: Chart.colors.output,
				turboThreshold: 0,
			},
			{
				data: [[-180, 0]],
				type: 'line',
				name: 'Marges de stabilité',
				color: Chart.colors.stability,
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
			title: {text : 'Phase (°)'},
			softMin: -95,
			softMax: 5,
			
			tickInterval: 90,
			gridLineWidth: 2,
			
			minorTickInterval: 15,
			minorGridLineWidth: 1,
			
			events: {
				afterSetExtremes: () => {
					this.update(false);
				},
			},
		},
		yAxis: {
			title: {text : 'Gain (dB)'},
			softMin: -25,
			softMax: 5,
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
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});

				return [
					`<span style="color:${this.point.color}">\u25CF</span> <span style="font-size:10px;">${this.series.name}</span>`,
					`Pulsation : <b>${Chart.formatFrequency((this.point as any).w)}</b>`,
					`Phase : <b>${formatter.format(this.x as number)} °</b>`,
					`Gain : <b>${formatter.format(this.y as number)} dB</b>`,
				].join('<br />');
			},
		},
	};
	
	constructor() {}
	
	ngAfterViewInit(): void {
		this.chart = Highcharts.chart(this.chartElement!.nativeElement, deepmerge.all([Chart.options, this.options]));
		this.update();
		new ResizeObserver(() => this.chart!.reflow()).observe(this.chartElement!.nativeElement);
	}
	
	update(animate = true, nbPoints = 1001): void {
		if (this.chart === undefined) {
			return;
		}
		
		const response = this.frequentialResponseCalculator.getPolarResponse(this.wMin, this.wMax, nbPoints);
		this.setLineData(Data.Real, response.phases, response.gains, response.ws);

		this.chart.removeAnnotation('Marge de gain');
		this.chart.removeAnnotation('Marge de phase');
		if (this.chart.series[Data.StabilityMargins].visible) {
			this.addGainMarginAnnotation(this.frequentialResponseCalculator.getGainMargin(response));
			this.addPhaseMarginAnnotation(this.frequentialResponseCalculator.getPhaseMargin(response));
		}

		this.chart.redraw(animate);
	}

	addGainMarginAnnotation(gainMargin: GainMargin): void {
		if (gainMargin === null) {
			return;
		}

		this.chart!.addAnnotation({
			id: 'Marge de gain',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: Chart.colors.stability,
				fill: Chart.colors.stability,
			},
			shapes: [
				{
					strokeWidth: 3,
					points: [
						{x: -180, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					points: [
						{x: -180, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: -180, y: gainMargin.gain / 2, xAxis: 0, yAxis: 0},
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(-gainMargin.gain) + ' dB',
				align: -gainMargin.gain > 0 ? 'right' : 'left',
				verticalAlign: 'middle',
				x: -gainMargin.gain > 0 ? -10 : 10,
				y: 0,
			}],
		});
	}

	addPhaseMarginAnnotation(phaseMargin: PhaseMargin): void {
		if (phaseMargin === null) {
			return;
		}

		this.chart!.addAnnotation({
			id: 'Marge de phase',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: Chart.colors.stability,
				fill: Chart.colors.stability,
			},
			shapes: [
				{
					strokeWidth: 3,
					points: [
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
						{x: phaseMargin.phase, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					points: [
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
						{x: phaseMargin.phase, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: (phaseMargin.phase - 180) / 2, y: 0, xAxis: 0, yAxis: 0},
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(phaseMargin.phase + 180) + ' °',
				align: 'center',
				verticalAlign: (phaseMargin.phase + 180) > 0 ? 'bottom' : 'top',
				x: 0,
				y: (phaseMargin.phase + 180) > 0 ? -10 : 10,
			}],
		});
	}
	
	setLineData(dataType: Data, x: number[], y: number[], w: number[]): void {
		if (this.chart!.series[dataType].visible) {
			this.chart!.series[dataType].setData(x.map((_, index) => ({x: x[index], y: y[index], w: w[index]})), false);
		}
	}
	
	ngOnChanges() {
		this.frequentialResponseCalculator = new FrequentialResponseCalculator(this.transferFunction);
		this.update();
	}
}
