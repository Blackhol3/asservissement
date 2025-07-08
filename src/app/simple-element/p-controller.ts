import { SimpleElement } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PController extends SimpleElement {
	constructor() {
		super('Correcteur P', [
			{
				name: 'Gain proportionnel',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
		]);
	}

	get transferFunction() {
		const numerator = new Polynomial([this.characteristics[0].value]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
