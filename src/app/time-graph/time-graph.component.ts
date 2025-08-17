import { Component, ChangeDetectionStrategy, ElementRef, computed, effect, input, linkedSignal, untracked } from '@angular/core';
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
	readonly timeRange = linkedSignal(() => this.getDefaultExtremes());
	
	readonly chart: Highcharts.Chart;
	
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
				data: [[0, 0], [Number.POSITIVE_INFINITY, 0]],
				type: 'line',
				showInLegend: false,
				enableMouseTracking: false,
			},
		],
		xAxis: {
			title: {text : 'Temps (s)'},
			min: 0,
			max: 5,
			events: {
				afterSetExtremes: event => {
					if (event.trigger !== undefined) {
						this.timeRange.set(event.userMin !== undefined ? [event.min, event.max] : this.getDefaultExtremes());
						this.update(false);
					}
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

	update(animate = true, nbPoints = 1001): void {
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

		const [tMin, tMax] = untracked(this.timeRange);
		const response = this.timeResponseCalculator().getResponse(tMin, tMax, nbPoints);
		
		this.setLineData(SeriesType.Input, response.input.x, response.input.y);
		this.setLineData(SeriesType.Output, response.output.x, response.output.y);
		
		if (this.getSeries(SeriesType.Asymptote).visible) {
			this.setLineData(
				SeriesType.Asymptote,
				[tMin, tMax],
				this.timeResponseCalculator().getAsymptote(tMin, tMax),
			);
		}
		
		if (this.getSeries(SeriesType.Tangent).visible) {
			this.setLineData(
				SeriesType.Tangent,
				[tMin, tMax],
				this.timeResponseCalculator().getTangent(tMin, tMax),
			);
		}
		
		this.chart.removeAnnotation('Temps de réponse à 5 %');
		if (this.getSeries(SeriesType.Rapidity).visible) {
			this.getSeries(SeriesType.Rapidity).setData(
				[
					[tMin, ...response.rapidity.stabilizedArea],
					[tMax, ...response.rapidity.stabilizedArea],
				],
				false
			);
			
			if (response.rapidity.wasInStabilizedArea) {
				this.chart.addAnnotation({
					id: 'Temps de réponse à 5 %',
					animation: animate,
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
				}, false);
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

	protected getDefaultExtremes(): [number, number] {
		const min = -0.05;

		const rawMax = 5 * this.timeResponseCalculator().characteristicTime;
		const roundedMax = Math.pow(10, Math.ceil(Math.log10(rawMax)));
		const max = (roundedMax / 2 >= rawMax) ? roundedMax / 2 : roundedMax;

		if (this.chart.resetZoomButton) {
			this.chart.resetZoomButton.destroy();
			this.chart.resetZoomButton = undefined;
		}

		this.chart.xAxis[0].setExtremes(min, max, false);
		this.chart.yAxis[0].setExtremes(undefined, undefined, false);

		return [min, max];
	}
}
