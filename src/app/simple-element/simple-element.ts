import { immerable } from 'immer';
import { TransferFunction } from '../transfer-function';

export interface Characteristic {
	readonly name: string,
	readonly minValue: number,
	readonly step: number,
	readonly defaultValue: number,
}

export abstract class SimpleElementType {
	[immerable] = true;

	constructor(
		readonly name: string,
		readonly shortName: string,
		readonly characteristics: readonly Characteristic[],
	) {}

	abstract getTransferFunction(values: readonly number[]): TransferFunction;

	getDefaultValues() {
		return this.characteristics.map(characteristic => characteristic.defaultValue);
	}
}

export class SimpleElement {
	[immerable] = true;
	readonly values: readonly number[];

	constructor(
		readonly type: SimpleElementType,
		values?: readonly number[],
	) {
		const defaultValues = this.type.getDefaultValues();
		if (values !== undefined && values.length !== defaultValues.length) {
			throw new Error('The number of values is not consistent with the element type.');
		}

		this.values = values ?? defaultValues;
	}

	get transferFunction() {
		return this.type.getTransferFunction(this.values);
	}

	toJSON() {
		return [this.type.shortName, ...this.values];
	}
}
