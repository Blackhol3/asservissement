import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { FrequentialResponseCalculator } from '../frequential-response-calculator';
import * as Chart from '../chart';
import * as deepmerge from 'deepmerge';

import type * as Highcharts from 'highcharts';
import type {} from 'highcharts/modules/annotations';

enum Data {
	Real,
}

/** @todo Erreur avec le span pour les pulsations < 1 */
@Component({
	selector: 'app-black-nichols-graph',
	templateUrl: './black-nichols-graph.component.html',
	styleUrls: ['./black-nichols-graph.component.less'],
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
			pointFormat: 'Gain: <b>{point.y} dB</b><br/>Phase: <b>{point.x} °</b><br/>',
		},
	};
	
	constructor() {}
	
	ngAfterViewInit(): void {
		this.chart = window.Highcharts.chart(this.chartElement!.nativeElement, deepmerge.all([Chart.options, this.options]));
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
