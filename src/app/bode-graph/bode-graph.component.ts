import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator } from '../frequential-response-calculator';
import * as Chart from '../chart';
import * as deepmerge from 'deepmerge';
import * as Highcharts from 'highcharts';

enum Data {
	Real,
	Asymptotic,
	StabilityMargins,
}

type GainMargin = {frequency: number, gain: number} | null;
type PhaseMargin = {frequency: number, phase: number} | null;

const wExtremeMin = 1e-12;
const wExtremeMax = 1e12;

function zeroLinearInterpolation(x0: number, y0: number, x1: number, y1: number): number {
	return x0 - y0 * (x1 - x0) / (y1 - y0);
}

function linearInterpolation(x0: number, y0: number, x1: number, y1: number, xInterp: number): number {
	return y0 + (xInterp - x0) * (y1 - y0) / (x1 - x0);
}

@Component({
	selector: 'app-bode-graph',
	templateUrl: './bode-graph.component.html',
	styleUrls: ['./bode-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodeGraphComponent implements OnChanges, AfterViewInit {
	@Input() transferFunction: TransferFunction = new TransferFunction();
	frequentialResponseCalculator: FrequentialResponseCalculator = new FrequentialResponseCalculator();
	
	@ViewChild('chartGainElement') chartGainElement: ElementRef<HTMLDivElement> | undefined;
	@ViewChild('chartPhaseElement') chartPhaseElement: ElementRef<HTMLDivElement> | undefined;
	
	chartGain: Highcharts.Chart | undefined;
	chartPhase: Highcharts.Chart | undefined;
	
	wMin: number = 1e-2;
	wMax: number = 1e1;
	
	optionsCommon: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'line',
				name: 'Réponse',
				color: Chart.colors[1],
			},
			{
				data: [],
				type: 'line',
				name: 'Réponse asymptotique',
				color: Chart.colors[3],
				enableMouseTracking: false,
			},
			{
				data: [],
				type: 'line',
				name: 'Marges de stabilité',
				color: Chart.colors[2],
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
			min: this.wMin,
			max: this.wMax,
			type: 'logarithmic',
			
			tickInterval: 1,
			gridLineWidth: 2,
			
			minorTickInterval: 0.1,
			minorGridLineWidth: 1,
		},
		plotOptions: {
			series: {
				events : {
					legendItemClick: (event: Highcharts.SeriesLegendItemClickEventObject) => {
						this.chartGain!.series[event.target.index].setVisible(undefined, false);
						this.chartPhase!.series[event.target.index].setVisible(undefined, false);
						this.update();
						event.preventDefault();
					},
				},
			},
		},
		tooltip: {
			formatter: function() {
				const formatter = new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});

				return [
					`<span style="font-size:10px">${Chart.formatFrequency(this.x as number)}</span>`,
					`<span style="color:${this.point.color}">\u25CF</span> ${this.series.name} : <b>${formatter.format(this.y as number)} ${this.series.chart.options.tooltip!.valueSuffix}</b>`,
				].join('<br />');
			},
		},
	};
	
	optionsGain: Highcharts.Options = {
		xAxis: {
			events: {
				afterSetExtremes: (event: Highcharts.AxisSetExtremesEventObject) => {
					this.wMin = event.min;
					this.wMax = event.max;
					this.update(false);
				},
			},
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

	constructor() {}
	
	ngAfterViewInit(): void {
		this.chartGain = Highcharts.chart(this.chartGainElement!.nativeElement, deepmerge.all([Chart.options, this.optionsCommon, this.optionsGain]));
		this.chartPhase = Highcharts.chart(this.chartPhaseElement!.nativeElement, deepmerge.all([Chart.options, this.optionsCommon, this.optionsPhase]));

		this.chartGain.series[Data.StabilityMargins].setData([[wExtremeMin, 0], [wExtremeMax, 0]], false);
		this.chartPhase.series[Data.StabilityMargins].setData([[wExtremeMin, -180], [wExtremeMax, -180]], false);
		
		Chart.synchronize([this.chartGain, this.chartPhase]);
		this.update();
		
		setTimeout(() => {
			this.chartGain!.reflow();
			this.chartPhase!.reflow();
		});
		new ResizeObserver(() => this.chartGain!.reflow()).observe(this.chartGainElement!.nativeElement);
		new ResizeObserver(() => this.chartPhase!.reflow()).observe(this.chartPhaseElement!.nativeElement);
	}
	
	update(animate = true, nbPoints = 1001): void {
		if (this.chartGain === undefined || this.chartPhase === undefined) {
			return;
		}
		
		const response = this.frequentialResponseCalculator.getPolarResponse(this.wMin, this.wMax, nbPoints);
		const asymptoticResponse = this.frequentialResponseCalculator.getAsymptoticPolarResponse(this.wMin, this.wMax);
		
		this.setLineData(this.chartGain, Data.Real, response.ws, response.gains);
		this.setLineData(this.chartPhase, Data.Real, response.ws, response.phases);
		
		this.setLineData(this.chartGain, Data.Asymptotic, asymptoticResponse.ws, asymptoticResponse.gains);
		this.setLineData(this.chartPhase, Data.Asymptotic, asymptoticResponse.ws, asymptoticResponse.phases);

		this.chartGain.removeAnnotation('Marge de gain');
		this.chartGain.removeAnnotation('Marge de phase');
		this.chartPhase.removeAnnotation('Marge de gain');
		this.chartPhase.removeAnnotation('Marge de phase');
		if (this.chartGain.series[Data.StabilityMargins].visible) {
			let gainMargin: GainMargin = null;
			let phaseMargin: PhaseMargin = null;
			for (let i = 1; i < response.ws.length; ++i) {
				if (Math.sign(response.phases[i - 1] + 180) != Math.sign(response.phases[i] + 180) && (gainMargin === null || response.gains[i] > gainMargin.gain)) {
					const w = zeroLinearInterpolation(response.ws[i - 1], response.phases[i - 1] + 180, response.ws[i], response.phases[i] + 180)
					gainMargin = {
						frequency: w,
						gain: linearInterpolation(response.ws[i - 1], response.gains[i - 1], response.ws[i], response.gains[i], w),
					};
				}

				if (Math.sign(response.gains[i - 1]) != Math.sign(response.gains[i]) && (phaseMargin === null || response.phases[i] < phaseMargin.phase)) {
					const w = zeroLinearInterpolation(response.ws[i - 1], response.gains[i - 1], response.ws[i], response.gains[i])
					phaseMargin = {
						frequency: w,
						phase: linearInterpolation(response.ws[i - 1], response.phases[i - 1], response.ws[i], response.phases[i], w),
					};
				}
			}

			this.addGainMarginAnnotation(gainMargin);
			this.addPhaseMarginAnnotation(phaseMargin);
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
				stroke: Chart.colors[2],
				fill: Chart.colors[2],
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
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(-gainMargin.gain) + ' dB',
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
				stroke: Chart.colors[2],
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
				stroke: Chart.colors[2],
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
				stroke: Chart.colors[2],
				fill: Chart.colors[2],
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
				text: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
					signDisplay: 'always',
				}).format(phaseMargin.phase + 180) + ' °',
				align: 'left',
				verticalAlign: 'middle',
				x: 10,
				y: 0,
			}],
		});
	}
	
	setLineData(chart: Highcharts.Chart, dataType: Data, x: number[], y: number[]): void {
		if (chart.series[dataType].visible) {
			chart.series[dataType].setData(x.map((value, index) => [value, y[index]]), false);
		}
	}
	
	ngOnChanges() {
		this.frequentialResponseCalculator = new FrequentialResponseCalculator(this.transferFunction);
		this.update();
	}
}
