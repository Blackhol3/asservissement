import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class Integrator extends SimpleElementType {
	constructor() {
		super('Intégrateur', 'I', [
			{
				name: 'Ordre',
				minValue: 1,
				step: 1,
				defaultValue: 1,
			},
		]);
	}

	getTransferFunction([ordre]: [number]) {
		const numerator = new Polynomial([1]);
		const denominator = new Polynomial([...Array<number>(ordre).fill(0), 1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
