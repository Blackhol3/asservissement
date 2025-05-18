import { Component, OnChanges, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as deepmerge from 'deepmerge';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

import { TransferFunction } from '../transfer-function';
import { InputType } from '../common-type';
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
	standalone: true,
})
export class TimeGraphComponent implements OnChanges, AfterViewInit {
	@Input() transferFunction: TransferFunction = new TransferFunction();
	@Input() inputType: InputType = InputType.Step;
	
	@ViewChild('chartElement') chartElement: ElementRef<HTMLDivElement> | undefined;
	chart: Highcharts.Chart | undefined;
	
	tMin: number = -0.05;
	tMax: number = 5;
	
	options: Highcharts.Options  = {
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
					`<span style="font-size:10px">${formatter.format(this.x as number)} s</span>`,
					`<span style="color:${this.color}">\u25CF</span> ${this.series.name} : <b>${formatter.format(this.y as number)}</b>`,
				].join('<br />');
			},
		},
		legend: {
			events: {
				itemClick: event => {
					(event.legendItem as Highcharts.Series).setVisible(undefined, false);
					this.update();
					event.preventDefault();
				},
			},
		},
	};
	
	constructor(private snackBar: MatSnackBar) { }
	
	ngAfterViewInit(): void {
		this.chart = Highcharts.chart(this.chartElement!.nativeElement, deepmerge.all([Chart.options, this.options]));
		this.update();
		new ResizeObserver(() => this.chart!.reflow()).observe(this.chartElement!.nativeElement);
	}
	
	update(animate = true, dt = 1e-3, nbPoints = 1001): void {
		if (this.chart === undefined) {
			return;
		}
		
		const tMin = this.tMin;
		const tMax = this.tMax;
		const dtMin = (tMax - tMin)/(nbPoints - 1);
		dt = Math.min(dt, dtMin);
		
		const recursiveTransferFunction = this.transferFunction.getRecursiveTransferFunction(dt);
		
		const input_memory = new Array(recursiveTransferFunction.numerator.order + 1).fill(0);
		const output_memory = new Array(recursiveTransferFunction.denominator.order).fill(0);
		
		const ts = [];
		const inputs = [];
		const outputs = [];
		const rapidity = {stabilizedArea: [this.getAsymptote()[0] * 0.95, this.getAsymptote()[0] * 1.05], wasInStabilizedArea: false, time: 0, value: 0};
		
		for (let t = 0; t < tMax; t += dt) {
			const input = this.getInput(t, dt);
			
			input_memory.unshift(input);
			input_memory.pop();
			
			let output = 0;
			recursiveTransferFunction.numerator.coefficients.forEach((value, order) => {
				output += input_memory[order] * value;
			});
			recursiveTransferFunction.denominator.coefficients.forEach((value, order) => {
				if (order === 0) {
					return;
				}
				
				output -= output_memory[order - 1] * value;
			});
			
			if (t >= tMin && (ts.length === 0 || t >= ts[ts.length - 1] + dtMin)) {
				ts.push(t);
				inputs.push(input);
				outputs.push(output);
			}
			
			if (rapidity.wasInStabilizedArea === false && output >= rapidity.stabilizedArea[0] && output <= rapidity.stabilizedArea[1]) {
				rapidity.wasInStabilizedArea = true;
				rapidity.time = t;
				rapidity.value = output;
			}
			else if (rapidity.wasInStabilizedArea === true && (output < rapidity.stabilizedArea[0] || output > rapidity.stabilizedArea[1])) {
				rapidity.wasInStabilizedArea = false;
			}
			
			output_memory.unshift(output);
			output_memory.pop();
		}
		
		if (this.chart.series[Data.Rapidity].visible && !this.hasHorizontalAsymptote()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas d'asymptote horizontale.", undefined, {duration: 3000});
			this.chart.series[Data.Rapidity].setVisible(false, false);
		}
		
		if (this.chart.series[Data.Asymptote].visible && !this.hasAsymptote()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas d'asymptote.", undefined, {duration: 3000});
			this.chart.series[Data.Asymptote].setVisible(false, false);
		}
		
		if (this.chart.series[Data.Tangent].visible && !this.hasTangent()) {
			this.snackBar.open("La réponse de cette fonction de transfert ne possède pas de tangente à l'origine.", undefined, {duration: 3000});
			this.chart.series[Data.Tangent].setVisible(false, false);
		}
		
		this.setLineData(
			Data.Input,
			[-0.001, 0, ...ts],
			[0, 0, ...inputs]
		);
		
		this.setLineData(
			Data.Output,
			[-0.001, 0, ...ts],
			[0, 0, ...outputs]
		);
		
		if (this.chart.series[Data.Asymptote].visible) {
			this.setLineData(
				Data.Asymptote,
				[tMin, tMax],
				this.getAsymptote()
			);
		}
		
		if (this.chart.series[Data.Tangent].visible) {
			this.setLineData(
				Data.Tangent,
				[tMin, tMax],
				this.getTangent()
			);
		}
		
		this.chart.removeAnnotation('Temps de réponse à 5 %');
		if (this.chart.series[Data.Rapidity].visible) {
			const horizontalAsymptote = this.getAsymptote()[0];
			this.chart.series[Data.Rapidity].setData(
				[
					[tMin, horizontalAsymptote * 0.95, horizontalAsymptote * 1.05],
					[tMax, horizontalAsymptote * 0.95, horizontalAsymptote * 1.05],
				],
				false
			);
			
			if (rapidity.wasInStabilizedArea) {
				this.chart.addAnnotation({
					id: 'Temps de réponse à 5 %',
					labels: [{
						point: {
							x: rapidity.time,
							y: rapidity.value,
							xAxis: 0,
							yAxis: 0,
						},
						distance: rapidity.value > horizontalAsymptote ? 10 : -40,
						text: 't<sub>5%</sub>',
						useHTML: true,
					}],
				});
			}
		}
		
		this.chart.redraw(animate);
	}
	
	setLineData(dataType: Data, x: number[], y: number[]): void {
		if (this.chart?.series[dataType].visible) {
			this.chart.series[dataType].setData(x.map((value, index) => [value, y[index]]), false);
		}
	}
	
	ngOnChanges(): void {
		this.update();
	}
	
	getInput(t: number, dt: number): number {
		if (t < 0) {
			return 0;
		}
		
		if (this.inputType === InputType.Impulse) {
			return (t === 0) ? 1/dt : 0;
		}
			
		if (this.inputType === InputType.Step) {
			return 1;
		}
		
		if (this.inputType === InputType.Ramp) {
			return t;
		}
		
		throw new Error('No value associated with the selected input type.');
	}
	
	hasAsymptote(): boolean {
		return this.inputType + this.transferFunction.zeroMultiplicity <= 2;
	}
	
	hasHorizontalAsymptote(): boolean {
		return this.inputType + this.transferFunction.zeroMultiplicity <= 1;
	}
	
	getAsymptote(): [number, number] {
		const expandedTransferFunction = this.transferFunction.getExpandedTransferFunction();
		const zeroMultiplicity = this.transferFunction.zeroMultiplicity;
		
		const values = [
			0,
			0,
			expandedTransferFunction.numerator.at(0) / expandedTransferFunction.denominator.at(zeroMultiplicity),
			(expandedTransferFunction.numerator.at(1)*expandedTransferFunction.denominator.at(zeroMultiplicity) - expandedTransferFunction.numerator.at(0)*expandedTransferFunction.denominator.at(zeroMultiplicity + 1)) / Math.pow(expandedTransferFunction.denominator.at(zeroMultiplicity), 2),
		];
		
		const A = values[this.inputType + zeroMultiplicity];
		const B = values[this.inputType + zeroMultiplicity + 1];
		
		return [
			A * this.tMin + B,
			A * this.tMax + B,
		];
	}
	
	hasTangent(): boolean {
		return this.transferFunction.order + this.inputType >= 2;
	}
	
	getTangent(): [number, number] {
		if (this.transferFunction.order + this.inputType > 2) {
			return [0, 0];
		}
		
		const expandedTransferFunction = this.transferFunction.getExpandedTransferFunction();
		const A = expandedTransferFunction.numerator.at(expandedTransferFunction.numerator.order) / expandedTransferFunction.denominator.at(expandedTransferFunction.denominator.order);
		
		return [
			A * this.tMin,
			A * this.tMax,
		];
	}
}
