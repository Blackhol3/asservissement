import { Component, ViewEncapsulation } from '@angular/core';
import { animate, style, trigger, transition } from '@angular/animations';
import { TransferFunction } from './transfer-function';
import { TilesModeType } from './common-type';

import { SimpleElement } from './simple-element/simple-element';
import { FirstOrder } from './simple-element/first-order';
import { SecondOrder } from './simple-element/second-order';
import { InverseFirstOrder } from './simple-element/inverse-first-order';
import { InverseSecondOrder } from './simple-element/inverse-second-order';
import { Integrator } from './simple-element/integrator';
import { Differentiator } from './simple-element/differentiator';
import { PController } from './simple-element/p-controller';
import { PIController } from './simple-element/pi-controller';
import { PIDController } from './simple-element/pid-controller';
import { PhaseLeadCompensator } from './simple-element/phase-lead-compensator';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [
		trigger('items', [
			transition(':enter', [
				style({ transform: 'scale(0.5)', opacity: 0 }),
				animate(
					'250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
					style({ transform: 'scale(1)', opacity: 1 })
				),
			]),
			transition(':leave', [
				style({ transform: 'scale(1)', opacity: 1, height: '*' }),
				animate(
					'250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
					style({transform: 'scale(0.5)', opacity: 0, height: '0px'})
				),
			]),
		])
	],
	encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
	simpleElements: SimpleElement[] = [];
	simpleElementTypes: ([string, () => SimpleElement] | null)[] = [
		[(new FirstOrder()).name, () => new FirstOrder()],
		[(new SecondOrder()).name, () => new SecondOrder()],
		null,
		[(new InverseFirstOrder()).name, () => new InverseFirstOrder()],
		[(new InverseSecondOrder()).name, () => new InverseSecondOrder()],
		null,
		[(new Integrator()).name, () => new Integrator()],
		[(new Differentiator()).name, () => new Differentiator()],
		null,
		[(new PController()).name, () => new PController()],
		[(new PIController()).name, () => new PIController()],
		[(new PIDController()).name, () => new PIDController()],
		[(new PhaseLeadCompensator()).name, () => new PhaseLeadCompensator()],
		
	];
	
	transferFunction = new TransferFunction();
	transferFunctionTex = '';
	
	transferFunctionClosedLoop = new TransferFunction();
	transferFunctionClosedLoopTex = '';
	
	tilesMode: TilesModeType = TilesModeType.HalfHorizontal;
	
	add(index: number): void {
		this.simpleElements.push(this.simpleElementTypes[index]![1]());
		this.update();
	}
	
	remove(index: number): void {
		this.simpleElements.splice(index, 1);
		this.update();
	}
	
	update(): void {
		this.transferFunction = new TransferFunction();
		this.transferFunctionTex = '\\begin{align}FTBO(p) &= ';
		
		this.simpleElements.forEach((element) => {
			this.transferFunction = this.transferFunction.multiply(element.transferFunction);
			this.transferFunctionTex += element.transferFunction.getTex();
		});
		
		this.transferFunctionClosedLoop = this.transferFunction.getClosedLoopTransferFunction();
		this.transferFunctionClosedLoopTex = '\\begin{align}FTBF(p) &= ';
		
		if (this.simpleElements.length === 0) {
			this.transferFunctionTex += '1';
			this.transferFunctionClosedLoopTex += '\\frac12';
			
		}
		else {
			this.transferFunctionClosedLoopTex += this.transferFunctionClosedLoop.getTex();
			
			if (this.simpleElements.length > 1) {
				this.transferFunctionTex += '\\\\&= ' + this.transferFunction.getExpandedTransferFunction().getTex();
			}
		}
		
		this.transferFunctionTex += '\\end{align}';
		this.transferFunctionClosedLoopTex += '\\end{align}';
	}
}
