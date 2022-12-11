import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator } from '../frequential-response-calculator';
import * as Chart from '../chart';
import * as deepmerge from 'deepmerge';
import * as Highcharts from 'highcharts';

enum Data {
	Real,
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
				color: Chart.colors[1],
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
		this.setLineData(Data.Real, response.phases, response.gains);
		this.chart.redraw(animate);
	}
	
	setLineData(dataType: Data, x: number[], y: number[]	): void {
		if (this.chart!.series[dataType].visible) {
			this.chart!.series[dataType].setData(x.map((value, index) => [value, y[index]]), false);
		}
	}
	
	ngOnChanges() {
		this.frequentialResponseCalculator = new FrequentialResponseCalculator(this.transferFunction);
		this.update();
	}
}
