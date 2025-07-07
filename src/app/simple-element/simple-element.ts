import { TransferFunction } from '../transfer-function'

export interface Characteristic {
	name: string,
	minValue: number,
	step: number,
	
	value: number,
}

export abstract class SimpleElement {
	abstract readonly name: string;
	abstract readonly characteristics: Characteristic[];
	abstract get transferFunction(): TransferFunction;
}
