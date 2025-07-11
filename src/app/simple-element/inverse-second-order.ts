import { SimpleElementType } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class InverseSecondOrder extends SimpleElementType {
	constructor() {
		super('Second ordre inversé', '2i', [
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
		const numerator = new Polynomial([K, 2*K*z/w0, K/(w0*w0)]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
