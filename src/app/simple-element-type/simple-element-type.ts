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
