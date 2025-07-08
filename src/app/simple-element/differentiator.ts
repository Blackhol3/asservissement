import { SimpleElement } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class Differentiator extends SimpleElement {
	constructor() {
		super('Dérivateur', [
			{
				name: 'Ordre',
				minValue: 1,
				step: 1,
				value: 1,
			},
		]);
	}
	
	get transferFunction() {
		const numerator = new Polynomial([...Array<number>(this.characteristics[0].value).fill(0), 1]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
