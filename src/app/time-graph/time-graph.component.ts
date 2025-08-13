import { Component, ChangeDetectionStrategy, ElementRef, computed, effect, input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { SeriesType } from '../common-type';
import { GraphOptions } from '../graph-options';
import { StateService } from '../state.service';
import { TimeResponseCalculator } from '../time-response-calculator';
import { TransferFunction } from '../transfer-function';
import * as Chart from '../chart';

const formatter = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

@Component({
	selector: 'app-time-graph',
	templateUrl: './time-graph.component.html',
	styleUrls: ['./time-graph.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeGraphComponent {
	readonly transferFunction = input.required<TransferFunction>();
	readonly graphOptions = input.required<GraphOptions>();

	readonly inputType = computed(() => this.graphOptions().inputType);
	readonly timeResponseCalculator = computed(() => new TimeResponseCalculator(this.transferFunction(), this.inputType()));
	
	readonly chart: Highcharts.Chart;
	
	tMin: number = -0.05;
	tMax: number = 5;
	
	options: Highcharts.Options = {
		series: [
			{
				data: [],
				type: 'line',
				name: 'Commande',
				id: SeriesType.Input,
			},
			{
				data: [],
				type: 'line',
				name: 'Réponse',
				id: SeriesType.Output,
			},
			{
				data: [],
				type: 'line',
				name: 'Asymptote',
				id: SeriesType.Asymptote,
				enableMouseTracking: false,
			},
			{
				data: [],
				type: 'line',
				name: "Tangente à l'origine",
				id: SeriesType.Tangent,
				enableMouseTracking: false,
			},
			{
				data: [],
				type: 'arearange',
				name: 'Temps de réponse à 5 %',
				id: SeriesType.Rapidity,
				enableMouseTracking: false,
			},
			{
				data: [[0, 0], [100, 0]],
				type: 'line',
				showInLegend: false,
				enableMouseTracking: false,
			},
		],
		xAxis: {
			title: {text : 'Temps (s)'},
			min: this.tMin,
			max: this.tMax,
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
				return [
					`<span style="font-size:10px">${formatter.format(this.x)} s</span>`,
					`<span class="highcharts-color-${this.colorIndex}">\u25CF</span> ${this.series.name} : <b>${formatter.format(this.y!)}</b>`,
				].join('<br />');
			},
		},
		legend: {
			events: {
				itemClick: event => {
					this.state.toggleSeriesVisibility(this.graphOptions(), (event.legendItem as Highcharts.Series).options.id as SeriesType);
					event.preventDefault(); // eslint-disable-line @typescript-eslint/no-unsafe-call
				},
			},
		},
	};

	constructor(
		private readonly chartElement: ElementRef<HTMLElement>,
		private readonly snackBar: MatSnackBar,
		private readonly state: StateService,
	) {
		const element = this.chartElement.nativeElement;
		this.chart = Highcharts.chart(element, Highcharts.merge(Chart.options, this.options));
		effect(() => this.update());
	}

	update(animate = true, dt = 1e-3, nbPoints = 1001): void {
		const visibleSeries = this.graphOptions().visibleSeries;
		for (const type of this.options.series!.map(x => x.id).filter(id => id !== undefined) as SeriesType[]) {
			this.getSeries(type).setVisible(visibleSeries.has(type), false);
		}

		if (this.getSeries(SeriesType.Rapidity).visible && !this.timeResponseCalculator().hasHorizontalAsymptote()) {
			this.openSnackBar("La réponse de cette fonction de transfert ne possède pas d'asymptote horizontale.");
			this.state.hideSeries(this.graphOptions(), SeriesType.Rapidity);
			return;
		}
		
		if (this.getSeries(SeriesType.Asymptote).visible && !this.timeResponseCalculator().hasAsymptote()) {
			this.openSnackBar("La réponse de cette fonction de transfert ne possède pas d'asymptote.");
			this.state.hideSeries(this.graphOptions(), SeriesType.Asymptote);
			return;
		}
		
		if (this.getSeries(SeriesType.Tangent).visible && !this.timeResponseCalculator().hasTangent()) {
			this.openSnackBar("La réponse de cette fonction de transfert ne possède pas de tangente à l'origine.");
			this.state.hideSeries(this.graphOptions(), SeriesType.Tangent);
			return;
		}

		this.state.projectionMode();

		const response = this.timeResponseCalculator().getResponse(this.tMin, this.tMax, dt, nbPoints);
		
		this.setLineData(SeriesType.Input, response.input.x, response.input.y);
		this.setLineData(SeriesType.Output, response.output.x, response.output.y);
		
		if (this.getSeries(SeriesType.Asymptote).visible) {
			this.setLineData(
				SeriesType.Asymptote,
				[this.tMin, this.tMax],
				this.timeResponseCalculator().getAsymptote(this.tMin, this.tMax),
			);
		}
		
		if (this.getSeries(SeriesType.Tangent).visible) {
			this.setLineData(
				SeriesType.Tangent,
				[this.tMin, this.tMax],
				this.timeResponseCalculator().getTangent(this.tMin, this.tMax),
			);
		}
		
		this.chart.removeAnnotation('Temps de réponse à 5 %');
		if (this.getSeries(SeriesType.Rapidity).visible) {
			this.getSeries(SeriesType.Rapidity).setData(
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
	
	setLineData(type: SeriesType, x: number[], y: number[]): void {
		const series = this.getSeries(type);
		if (series.visible) {
			series.setData(x.map((value, index) => [value, y[index]]), false);
		}
	}

	protected getSeries(type: SeriesType) {
		return this.chart.get(type) as Highcharts.Series;
	}

	protected openSnackBar(message: string) {
		if (this.snackBar._openedSnackBarRef === null) {
			this.snackBar.open(message, undefined, {duration: 3000});
		}
	}
}
