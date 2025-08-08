import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, type AfterViewInit, computed, effect, input, linkedSignal, untracked, signal } from '@angular/core';

import * as deepmerge from 'deepmerge';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { SeriesType } from '../common-type';
import { GraphOptions } from '../graph-options';
import { StateService } from '../state.service';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator, type GainMargin, type PhaseMargin } from '../frequential-response-calculator';
import * as Chart from '../chart';

const wExtremeMin = 1e-12;
const wExtremeMax = 1e12;

const wDefaultMin = 1e-2;
const wDefaultMax = 1e1;

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
	selector: 'app-bode-graph',
	templateUrl: './bode-graph.component.html',
	styleUrls: ['./bode-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodeGraphComponent implements AfterViewInit {
	readonly transferFunction = input.required<TransferFunction>();
	readonly graphOptions = input.required<GraphOptions>();

	readonly frequentialResponseCalculator = computed(() => new FrequentialResponseCalculator(this.transferFunction()));
	readonly frequencyRange = linkedSignal<[number, number]>(() => {
		const ws = this.frequentialResponseCalculator().getAsymptoticChanges().map(change => change.w);

		if (ws.length === 0) {
			return [wDefaultMin, wDefaultMax];
		}

		const wMin = Math.pow(10, Math.floor(Math.log10(Math.min(...ws)) - 0.5));
		const wMax = Math.pow(10, Math.ceil(Math.log10(Math.max(...ws)) + 0.5));
		
		if (this.chartGain !== undefined && this.chartPhase !== undefined) {
			const options: Highcharts.Options = {
				xAxis: {
					min: wMin,
					max: wMax,
				},
			};
			
			// Reset user zoom without triggering a redraw
			(this.chartGain as any).transform({reset: true}); // eslint-disable-line

			this.chartGain.update(options, false);
			this.chartPhase.update(options, false);
		}

		return [wMin, wMax];
	});
	
	@ViewChild('chartGainElement') chartGainElement: ElementRef<HTMLDivElement> | undefined;
	@ViewChild('chartPhaseElement') chartPhaseElement: ElementRef<HTMLDivElement> | undefined;
	
	chartGain: Highcharts.Chart | undefined;
	chartPhase: Highcharts.Chart | undefined;
	readonly chartsReady = signal(false);
	
	optionsCommon: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'line',
				name: 'Réponse',
				color: Chart.colors.output,
				id: SeriesType.Real,
			},
			{
				data: [],
				type: 'line',
				name: 'Réponse asymptotique',
				color: Chart.colors.asymptotic,
				id: SeriesType.Asymptotic,
				enableMouseTracking: false,
			},
			{
				data: [],
				type: 'line',
				name: 'Marges de stabilité',
				color: Chart.colors.stability,
				id: SeriesType.StabilityMargins,
				lineWidth: 1,
				visible: false
			},
			{
				data: [[wExtremeMin, 0], [wExtremeMax, 0]],
				type: 'line',
				color: 'rgba(0, 0, 0, 0)',
				showInLegend: false,
			},
		],
		xAxis: {
			title: {text : 'Pulsation (rad/s)'},
			min: wDefaultMin,
			max: wDefaultMax,
			type: 'logarithmic',
			
			tickInterval: 1,
			gridLineWidth: 2,
			
			minorTickInterval: 0.1,
			minorGridLineWidth: 1,
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
					`<span style="font-size:10px">${Chart.formatFrequency(this.x)}</span>`,
					`<span style="color:${this.color as string}">\u25CF</span> ${this.series.name} : <b>${formatter.format(this.y!)} ${this.series.chart.options.tooltip!.valueSuffix}</b>`,
				].join('<br />');
			},
		},
		chart: {
			marginLeft: 60,
		}
	};
	
	optionsGain: Highcharts.Options = {
		xAxis: {
			events: {
				afterSetExtremes: (event: Highcharts.AxisSetExtremesEventObject) => {
					if (event.trigger !== undefined) {
						this.frequencyRange.set([event.min, event.max]);
						this.update(false);
					}
				},
			},
			labels: {
				enabled: false,
			},
			lineWidth: 0,
			tickLength: 0,
			title: undefined,
		},
		yAxis: {
			title: {text : 'Gain (dB)'},
		},
		tooltip: {
			valueSuffix: 'dB',
		},
	};
	
	optionsPhase: Highcharts.Options = {
		legend: {
			enabled: false,
		},
		yAxis: {
			title: {text : 'Phase (°)'},
			
			tickInterval: 90,
			gridLineWidth: 2,
			
			minorTickInterval: 15,
			minorGridLineWidth: 1,
		},
		tooltip: {
			valueSuffix: '°',
		},
	};

	constructor(
		private readonly state: StateService,
	) {
		effect(() => this.update());
	}
	
	ngAfterViewInit(): void {
		this.chartGain = Highcharts.chart(this.chartGainElement!.nativeElement, deepmerge.all([Chart.options, this.optionsCommon, this.optionsGain]));
		this.chartPhase = Highcharts.chart(this.chartPhaseElement!.nativeElement, deepmerge.all([Chart.options, this.optionsCommon, this.optionsPhase]));

		this.getSeries(this.chartGain, SeriesType.StabilityMargins).setData([[wExtremeMin, 0], [wExtremeMax, 0]], false);
		this.getSeries(this.chartPhase, SeriesType.StabilityMargins).setData([[wExtremeMin, -180], [wExtremeMax, -180]], false);
		
		Chart.synchronize([this.chartGain, this.chartPhase]);
		this.chartsReady.set(true);
		
		new ResizeObserver(() => this.chartGain!.reflow()).observe(this.chartGainElement!.nativeElement);
		new ResizeObserver(() => this.chartPhase!.reflow()).observe(this.chartPhaseElement!.nativeElement);
	}

	update(animate = true, nbPoints = 1001): void {
		if (!this.chartsReady()) {
			return;
		}

		if (this.chartGain === undefined || this.chartPhase === undefined) {
			return;
		}

		const visibleSeries = this.graphOptions().visibleSeries;
		for (const type of this.optionsCommon.series!.map(x => x.id).filter(id => id !== undefined) as SeriesType[]) {
			this.getSeries(this.chartGain, type).setVisible(visibleSeries.has(type), false);
			this.getSeries(this.chartPhase, type).setVisible(visibleSeries.has(type), false);
		}
		
		const response = this.frequentialResponseCalculator().getPolarResponse(...untracked(this.frequencyRange), nbPoints);
		this.setLineData(this.chartGain, SeriesType.Real, response.ws, response.gains);
		this.setLineData(this.chartPhase, SeriesType.Real, response.ws, response.phases);
		
		if (visibleSeries.has(SeriesType.Asymptotic)) {
			const asymptoticResponse = this.frequentialResponseCalculator().getAsymptoticPolarResponse(...untracked(this.frequencyRange));
			this.setLineData(this.chartGain, SeriesType.Asymptotic, asymptoticResponse.ws, asymptoticResponse.gains);
			this.setLineData(this.chartPhase, SeriesType.Asymptotic, asymptoticResponse.ws, asymptoticResponse.phases);
		}

		this.chartGain.removeAnnotation('Marge de gain');
		this.chartGain.removeAnnotation('Marge de phase');
		this.chartPhase.removeAnnotation('Marge de gain');
		this.chartPhase.removeAnnotation('Marge de phase');
		if (visibleSeries.has(SeriesType.StabilityMargins)) {
			this.addGainMarginAnnotation(this.frequentialResponseCalculator().getGainMargin(response));
			this.addPhaseMarginAnnotation(this.frequentialResponseCalculator().getPhaseMargin(response));
		}

		this.chartGain.redraw(animate);
		this.chartPhase.redraw(animate);
	}

	addGainMarginAnnotation(gainMargin: GainMargin): void {
		if (gainMargin === null) {
			return;
		}

		this.chartGain!.addAnnotation({
			id: 'Marge de gain',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: Chart.colors.stability,
				fill: Chart.colors.stability,
			},
			shapes: [
				{
					dashStyle: 'LongDashDot',
					points: [
						{x: gainMargin.frequency, y: -1e6, xAxis: 0, yAxis: 0},
						{x: gainMargin.frequency, y: gainMargin.gain, xAxis: 0, yAxis: 0},
					],
				}, {
					strokeWidth: 3,
					points: [
						{x: gainMargin.frequency, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: gainMargin.frequency, y: 0, xAxis: 0, yAxis: 0},
					],
				}, {
					points: [
						{x: gainMargin.frequency, y: gainMargin.gain, xAxis: 0, yAxis: 0},
						{x: gainMargin.frequency, y: 0, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				}
			],
			labels: [{
				point: {x: gainMargin.frequency, y: gainMargin.gain / 2, xAxis: 0, yAxis: 0},
				text: marginFormatter.format(-gainMargin.gain) + ' dB',
				align: 'left',
				verticalAlign: 'middle',
				x: 10,
				y: 0,
			}],
		});

		this.chartPhase!.addAnnotation({
			id: 'Marge de gain',
			draggable: '',
			shapes: [{
				type: 'path',
				stroke: Chart.colors.stability,
				dashStyle: 'LongDashDot',
				points: [
					{x: gainMargin.frequency, y: -180, xAxis: 0, yAxis: 0},
					{x: gainMargin.frequency, y: +1e6, xAxis: 0, yAxis: 0},
				],
			}],
		});
	}

	addPhaseMarginAnnotation(phaseMargin: PhaseMargin): void {
		if (phaseMargin === null) {
			return;
		}

		this.chartGain!.addAnnotation({
			id: 'Marge de phase',
			draggable: '',
			shapes: [{
				type: 'path',
				stroke: Chart.colors.stability,
				dashStyle: 'LongDashDot',
				points: [
					{x: phaseMargin.frequency, y: 0, xAxis: 0, yAxis: 0},
					{x: phaseMargin.frequency, y: -1e6, xAxis: 0, yAxis: 0},
				],
			}],
		});

		this.chartPhase!.addAnnotation({
			id: 'Marge de phase',
			draggable: '',
			shapeOptions: {
				type: 'path',
				stroke: Chart.colors.stability,
				fill: Chart.colors.stability,
			},
			shapes: [
				{
					dashStyle: 'LongDashDot',
					points: [
						{x: phaseMargin.frequency, y: 1e6, xAxis: 0, yAxis: 0},
						{x: phaseMargin.frequency, y: phaseMargin.phase, xAxis: 0, yAxis: 0},
					],
				}, {
					strokeWidth: 3,
					points: [
						{x: phaseMargin.frequency, y: -180, xAxis: 0, yAxis: 0},
						{x: phaseMargin.frequency, y: phaseMargin.phase, xAxis: 0, yAxis: 0},
					],
				}, {
					points: [
						{x: phaseMargin.frequency, y: -180, xAxis: 0, yAxis: 0},
						{x: phaseMargin.frequency, y: phaseMargin.phase, xAxis: 0, yAxis: 0},
					],
					markerEnd: 'arrow'
				}
			],
			labels: [{
				point: {x: phaseMargin.frequency, y: (phaseMargin.phase - 180) / 2, xAxis: 0, yAxis: 0},
				text: marginFormatter.format(phaseMargin.phase + 180) + ' °',
				align: 'left',
				verticalAlign: 'middle',
				x: 10,
				y: 0,
			}],
		});
	}
	
	setLineData(chart: Highcharts.Chart, type: SeriesType, x: number[], y: number[]): void {
		const series = this.getSeries(chart, type);
		if (series.visible) {
			series.setData(x.map((value, index) => [value, y[index]]), false);
		}
	}

	protected getSeries(chart: Highcharts.Chart, type: SeriesType) {
		return chart.get(type) as Highcharts.Series;
	}
}
