import { immerable, produce } from 'immer';

import { SimpleElement, type SimpleElementType } from './simple-element/simple-element';
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

import { TransferFunction } from './transfer-function';

export const SimpleElementTypes = [
	new FirstOrder(),
	new SecondOrder(),
	new InverseFirstOrder(),
	new InverseSecondOrder(),
	new Integrator(),
	new Differentiator(),
	new PController(),
	new PIController(),
	new PIDController(),
	new PhaseLeadCompensator(),
] as const;

export class SimpleElements {
	[immerable] = true;

	readonly transferFunction = this.getTransferFunction();
	readonly transferFunctionTex = this.getTransferFunctionTex();
	readonly transferFunctionClosedLoopTex = this.getTransferFunctionClosedLoopTex();

	constructor(
		private readonly list: readonly SimpleElement[] = [],
	) {}

	*[Symbol.iterator]() {
		yield* this.list[Symbol.iterator]();
	}

	add(type: SimpleElementType) {
		return new SimpleElements([...this.list, new SimpleElement(type)]);
	}

	update(element: SimpleElement, characteristicIndex: number, characteristicValue: number) {
		const index = this.list.findIndex(x => x === element);
		return new SimpleElements(produce(this.list, list => {
			list[index].values[characteristicIndex] = characteristicValue;
		}));
	}

	remove(element: SimpleElement) {
		return new SimpleElements(this.list.filter(x => x !== element));
	}

	toJSON() {
		return this.list.map(element => element.toJSON());
	}

	static fromJSON(data: ReturnType<SimpleElements['toJSON']>) {
		const list: SimpleElement[] = [];
		for (const element of data) {
			const elementType = SimpleElementTypes.find(type => type.shortName === element[0]);
			if (elementType === undefined) {
				throw new Error(`"${element[0]}" is not a valid element type.`);
			}

			list.push(new SimpleElement(elementType, element.slice(1) as number[]));
		}

		return new SimpleElements(list);
	}

	protected getTransferFunction() {
		let transferFunction = new TransferFunction();
		for (const element of this.list) {
			transferFunction = transferFunction.multiply(element.transferFunction);
		}

		return transferFunction;
	}

	protected getTransferFunctionTex() {
		let transferFunctionTex = '\\begin{align}FTBO(p) &= ';
		for (const element of this.list) {
			transferFunctionTex += element.transferFunction.getTex();
		}
		
		if (this.list.length === 0) {
			transferFunctionTex += '\\frac11';
		}
		else if (this.list.length > 1) {
			transferFunctionTex += '\\\\&= ' + this.transferFunction.getExpandedTransferFunction().getTex();
		}
		
		transferFunctionTex += '\\end{align}';
		return transferFunctionTex;
	}

	protected getTransferFunctionClosedLoopTex() {
		let transferFunctionClosedLoopTex = '\\begin{align}FTBF(p) &= ';
		
		if (this.list.length === 0) {
			transferFunctionClosedLoopTex += '\\frac12';
		}
		else {
			transferFunctionClosedLoopTex += this.transferFunction.getClosedLoopTransferFunction().getTex();
		}
		
		transferFunctionClosedLoopTex += '\\end{align}';
		return transferFunctionClosedLoopTex;
	}
}
