import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PIController extends SimpleElementType {
	constructor() {
		super('Correcteur PI', 'PI', [
			{
				name: 'Gain proportionnel',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
			{
				name: 'Constante de temps d\'intégration',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
		]);
	}
	
	getTransferFunction([Kp, Ti]: [number, number]) {
		const numerator = new Polynomial([Kp, Kp*Ti]);
		const denominator = new Polynomial([0, Ti]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
