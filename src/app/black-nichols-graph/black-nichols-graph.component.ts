import { Component, ChangeDetectionStrategy, ElementRef, computed, effect, input } from '@angular/core';

import deepmerge from 'deepmerge';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { SeriesType } from '../common-type';
import { GraphOptions } from '../graph-options';
import { StateService } from '../state.service';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator, type GainMargin, type PhaseMargin } from '../frequential-response-calculator';
import * as Chart from '../chart';

const formatter = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const marginFormatter = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	signDisplay: 'always',
});

@Component({
	selector: 'app-black-nichols-graph',
	templateUrl: './black-nichols-graph.component.html',
	styleUrls: ['./black-nichols-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlackNicholsGraphComponent {
	readonly transferFunction = input.required<TransferFunction>();
	readonly graphOptions = input.required<GraphOptions>();
	readonly frequentialResponseCalculator = computed(() => new FrequentialResponseCalculator(this.transferFunction()));
	
	readonly chart: Highcharts.Chart;
	
	wMin: number = 1e-3;
	wMax: number = 1e3;
	
	options: Highcharts.Options = {
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
				data: [[-180, 0]],
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
			title: {text : 'Phase (°)'},
			softMin: -95,
			softMax: 5,
			
			tickInterval: 90,
			minorTickInterval: 15,
			
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
					`Phase : <b>${formatter.format(this.x)} °</b>`,
					`Gain : <b>${formatter.format(this.y!)} dB</b>`,
				].join('<br />');
			},
		},
	};
	
	constructor(
		private readonly chartElement: ElementRef<HTMLElement>,
		private readonly state: StateService,
	) {
		const element = this.chartElement.nativeElement;
		this.chart = Highcharts.chart(element, deepmerge.all([Chart.options, this.options]));
		new ResizeObserver(() => this.chart.reflow()).observe(element);
		effect(() => this.update());
	}

	update(animate = true, nbPoints = 1001): void {
		this.state.projectionMode();

		const visibleSeries = this.graphOptions().visibleSeries;
		for (const type of this.options.series!.map(x => x.id).filter(id => id !== undefined) as SeriesType[]) {
			this.getSeries(type).setVisible(visibleSeries.has(type), false);
		}
		
		const response = this.frequentialResponseCalculator().getPolarResponse(this.wMin, this.wMax, nbPoints);
		this.setLineData(SeriesType.Real, response.phases, response.gains, response.ws);

		this.chart.removeAnnotation('Marge de gain');
		this.chart.removeAnnotation('Marge de phase');
		if (this.getSeries(SeriesType.StabilityMargins).visible) {
			this.addGainMarginAnnotation(this.frequentialResponseCalculator().getGainMargin(response));
			this.addPhaseMarginAnnotation(this.frequentialResponseCalculator().getPhaseMargin(response));
		}

		this.chart.redraw(animate);
	}

	addGainMarginAnnotation(gainMargin: GainMargin): void {
		if (gainMargin === null) {
			return;
		}

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
						{x: -180, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					className: 'arrow-head',
					points: [
						{x: -180, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: -180, y: gainMargin.gain / 2, xAxis: 0, yAxis: 0},
				text: marginFormatter.format(-gainMargin.gain) + ' dB',
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

		this.chart.addAnnotation({
			id: 'Marge de phase',
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
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
						{x: phaseMargin.phase, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					className: 'arrow-head',
					points: [
						{x: -180, y: 0, xAxis: 0, yAxis: 0},
						{x: phaseMargin.phase, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				},
			],
			labels: [{
				point: {x: (phaseMargin.phase - 180) / 2, y: 0, xAxis: 0, yAxis: 0},
				text: marginFormatter.format(phaseMargin.phase + 180) + ' °',
				align: 'center',
				verticalAlign: (phaseMargin.phase + 180) > 0 ? 'bottom' : 'top',
				x: 0,
				y: (phaseMargin.phase + 180) > 0 ? -10 : 10,
			}],
		});
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
