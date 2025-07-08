import { SimpleElement } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class FirstOrder extends SimpleElement {
	constructor() {
		super('Premier ordre', [
			{
				name: 'Gain statique',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
			{
				name: 'Constante de temps',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
		]);
	}

	get transferFunction() {
		const numerator = new Polynomial([this.characteristics[0].value]);
		const denominator = new Polynomial([1, this.characteristics[1].value]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
