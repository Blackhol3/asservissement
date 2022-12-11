import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator } from '../frequential-response-calculator';
import * as Chart from '../chart';
import * as deepmerge from 'deepmerge';
import * as Highcharts from 'highcharts';

enum Data {
	Real,
	Asymptotic,
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
				data: [[1e-12, 0], [1e12, 0]],
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
	
	optionsPhase: Highcharts.Options  = {
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
		
		this.chartGain.redraw(animate);
		this.chartPhase.redraw(animate);
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
