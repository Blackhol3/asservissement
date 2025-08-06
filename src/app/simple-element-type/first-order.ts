import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class FirstOrder extends SimpleElementType {
	constructor() {
		super('Premier ordre', '1', [
			{
				name: 'Gain statique',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
			{
				name: 'Constante de temps',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
		]);
	}

	getTransferFunction([K, tau]: [number, number]) {
		const numerator = new Polynomial([K]);
		const denominator = new Polynomial([1, tau]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
