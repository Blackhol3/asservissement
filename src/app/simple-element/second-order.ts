import { SimpleElementType } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class SecondOrder extends SimpleElementType {
	constructor() {
		super('Second ordre', '2', [
			{
				name: 'Gain statique',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
			{
				name: 'Pulsation propre',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 3,
			},
			{
				name: 'Amortissement',
				minValue: 0,
				step: 0.02,
				defaultValue: 1,
			},
		]);
	}

	getTransferFunction([K, w0, z]: [number, number, number]) {
		const numerator = new Polynomial([K]);
		const denominator = new Polynomial([1, 2*z/w0, 1/(w0*w0)]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
