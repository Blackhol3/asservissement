import { Component, ChangeDetectionStrategy, ElementRef, computed, effect, input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as deepmerge from 'deepmerge';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { InputType } from '../common-type';
import { TimeResponseCalculator } from '../time-response-calculator';
import { TransferFunction } from '../transfer-function';
import * as Chart from '../chart';

enum Data {
	Input,
	Output,
	Asymptote,
	Tangent,
	Rapidity,
}

@Component({
	selector: 'app-time-graph',
	templateUrl: './time-graph.component.html',
	styleUrls: ['./time-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeGraphComponent {
	readonly transferFunction = input.required<TransferFunction>();
	readonly inputType = input.required<InputType>();
	readonly timeResponseCalculator = computed(() => new TimeResponseCalculator(this.transferFunction(), this.inputType()));
	
	chart: Highcharts.Chart;
	
	tMin: number = -0.05;
	tMax: number = 5;
	
	options: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'line',
				name: 'Commande',
				color: Chart.colors.input,
			},
			{
				data: [],
				type: 'line',
				name: 'Réponse',
				color: Chart.colors.output,
			},
			{
				data: [],
				type: 'line',
				name: 'Asymptote',
				color: Chart.colors.output,
				dashStyle: 'LongDashDot',
				lineWidth: 1,
				enableMouseTracking: false,
				visible: false,
			},
			{
				data: [],
				type: 'line',
				name: "Tangente à l'origine",
				color: Chart.colors.output,
				dashStyle: 'LongDashDot',
				lineWidth: 1,
				visible: false
			},
			{
				data: [],
				type: 'arearange',
				name: 'Temps de réponse à 5 %',
				color: Chart.colors.rapidity,
				lineWidth: 1,
				fillOpacity: 0.5,
				visible: false,
			},
			{
				data: [[0, 0], [100, 0]],
				type: 'line',
				color: 'rgba(0, 0, 0, 0)',
				showInLegend: false,
			},
		],
		xAxis: {
			title: {text : 'Temps (s)'},
			min: this.tMin,
			max: this.tMax,
			gridLineWidth: 1,
			crosshair: true,
			events: {
				afterSetExtremes: (event: Highcharts.AxisSetExtremesEventObject) => {
					this.tMin = event.min;
					this.tMax = event.max;
					this.update(false);
				},
			},
		},
		yAxis: {
			title: {text : undefined},
			min: 0,
			max: 2,
		},
		tooltip: {
			formatter: function() {
				const formatter = new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 3,
					maximumFractionDigits: 3,
				});

				return [
					`<span style="font-size:10px">${formatter.format(this.x)} s</span>`,
					`<span style="color:${this.color as string}">\u25CF</span> ${this.series.name} : <b>${formatter.format(this.y as number)}</b>`,
				].join('<br />');
			},
		},
		legend: {
			events: {
				itemClick: event => {
					(event.legendItem as Highcharts.Series).setVisible(undefined, false);
					this.update();
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					event.preventDefault();
				},
			},
		},
	};

	constructor(
		private chartElement: ElementRef<HTMLElement>,
		private snackBar: MatSnackBar,
	) {
		const element = this.chartElement.nativeElement;
		this.chart = Highcharts.chart(element, deepmerge.all([Chart.options, this.options]));
		new ResizeObserver(() => this.chart.reflow()).observe(element);
		effect(() => this.update());
	}

	update(animate = true, dt = 1e-3, nbPoints = 1001): void {
		if (this.chart.series[Data.Rapidity].visible && !this.timeResponseCalculator().hasHorizontalAsymptote()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas d'asymptote horizontale.", undefined, {duration: 3000});
			this.chart.series[Data.Rapidity].setVisible(false, false);
		}
		
		if (this.chart.series[Data.Asymptote].visible && !this.timeResponseCalculator().hasAsymptote()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas d'asymptote.", undefined, {duration: 3000});
			this.chart.series[Data.Asymptote].setVisible(false, false);
		}
		
		if (this.chart.series[Data.Tangent].visible && !this.timeResponseCalculator().hasTangent()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas de tangente à l'origine.", undefined, {duration: 3000});
			this.chart.series[Data.Tangent].setVisible(false, false);
		}
		
		const response = this.timeResponseCalculator().getResponse(this.tMin, this.tMax, dt, nbPoints);
		
		this.setLineData(Data.Input, response.input.x, response.input.y);
		this.setLineData(Data.Output, response.output.x, response.output.y);
		
		if (this.chart.series[Data.Asymptote].visible) {
			this.setLineData(
				Data.Asymptote,
				[this.tMin, this.tMax],
				this.timeResponseCalculator().getAsymptote(this.tMin, this.tMax),
			);
		}
		
		if (this.chart.series[Data.Tangent].visible) {
			this.setLineData(
				Data.Tangent,
				[this.tMin, this.tMax],
				this.timeResponseCalculator().getTangent(this.tMin, this.tMax),
			);
		}
		
		this.chart.removeAnnotation('Temps de réponse à 5 %');
		if (this.chart.series[Data.Rapidity].visible) {
			this.chart.series[Data.Rapidity].setData(
				[
					[this.tMin, ...response.rapidity.stabilizedArea],
					[this.tMax, ...response.rapidity.stabilizedArea],
				],
				false
			);
			
			if (response.rapidity.wasInStabilizedArea) {
				this.chart.addAnnotation({
					id: 'Temps de réponse à 5 %',
					labels: [{
						point: {
							x: response.rapidity.time,
							y: response.rapidity.value,
							xAxis: 0,
							yAxis: 0,
						},
						distance: response.rapidity.value > response.rapidity.horizontalAsymptote ? 10 : -40,
						text: 't<sub>5%</sub>',
						useHTML: true,
					}],
				});
			}
		}
		
		this.chart.redraw(animate);
	}
	
	setLineData(dataType: Data, x: number[], y: number[]): void {
		if (this.chart.series[dataType].visible) {
			this.chart.series[dataType].setData(x.map((value, index) => [value, y[index]]), false);
		}
	}
}
