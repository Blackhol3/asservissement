import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class InverseFirstOrder extends SimpleElementType {
	constructor() {
		super('Premier ordre inversé', '1i', [
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
		const numerator = new Polynomial([K, K * tau]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
