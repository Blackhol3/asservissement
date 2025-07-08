import { immerable } from 'immer';
import { TransferFunction } from '../transfer-function';

export interface Characteristic {
	readonly name: string,
	readonly minValue: number,
	readonly step: number,
	
	readonly value: number,
}

export abstract class SimpleElement {
	[immerable] = true;
	
	constructor (
		readonly name: string,
		readonly characteristics: readonly Characteristic[],
	) {}
	abstract get transferFunction(): TransferFunction;
}
