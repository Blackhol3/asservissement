import { TransferFunction } from '../transfer-function'

export interface Characteristic {
	name: string
	minValue: number
	step: number
	
	value: number
}

export abstract class SimpleElement {
	abstract readonly name: string;
	abstract readonly characteristics: Characteristic[];
	protected _transferFunction = new TransferFunction();
	
	get transferFunction(): TransferFunction {
		return this._transferFunction;
	}
	
	abstract update(): void
}
