import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PController extends SimpleElementType {
	constructor() {
		super('Correcteur P', 'P', [
			{
				name: 'Gain proportionnel',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
		]);
	}

	getTransferFunction([K]: [number]) {
		const numerator = new Polynomial([K]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
