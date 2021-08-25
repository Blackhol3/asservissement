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
	selector: 'app-nyquist-graph',
	templateUrl: './nyquist-graph.component.html',
	styleUrls: ['./nyquist-graph.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NyquistGraphComponent implements OnChanges, AfterViewInit {
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
				lineWidth: 2,
			},
		],
		xAxis: {
			title: {text : 'Partie réelle'},
			events: {
				afterSetExtremes: () => this.updateAxes(),
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
			pointFormat: 'Réel: <b>{point.x}</b><br/>Imaginaire: <b>{point.y}</b><br/>',
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
		
		const response = this.frequentialResponseCalculator.getCartesianResponse(this.wMin, this.wMax, nbPoints);
		this.setLineData(Data.Real, response.reals, response.imaginaries);
		this.chart.redraw(animate);
	}
	
	updateAxes(): void {
		const axis = {
			x: this.chart!.xAxis[0],
			y: this.chart!.yAxis[0],
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
	
	setLineData(dataType: Data, x: number[], y: number[]): void {
		if (this.chart!.series[dataType].visible) {
			this.chart!.series[dataType].setData(x.map((value, index) => [value, y[index]]), false);
		}
	}
	
	ngOnChanges() {
		this.frequentialResponseCalculator = new FrequentialResponseCalculator(this.transferFunction);
		this.update();
		this.updateAxes();
	}
}
