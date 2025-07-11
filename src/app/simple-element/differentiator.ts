import { SimpleElementType } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class Differentiator extends SimpleElementType {
	constructor() {
		super('Dérivateur', 'D', [
			{
				name: 'Ordre',
				minValue: 1,
				step: 1,
				defaultValue: 1,
			},
		]);
	}
	
	getTransferFunction([ordre]: [number]) {
		const numerator = new Polynomial([...Array<number>(ordre).fill(0), 1]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
