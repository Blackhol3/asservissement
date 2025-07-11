import { SimpleElementType } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PhaseLeadCompensator extends SimpleElementType {
	constructor() {
		super('Correcteur à avance de phase', 'AP', [
			{
				name: 'Gain proportionnel',
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
			{
				name: 'Facteur d\'avance',
				minValue: 1,
				step: 0.1,
				defaultValue: 2,
			},
		]);
	}
	
	getTransferFunction([K, T, a]: [number, number, number]) {
		const numerator = new Polynomial([K, K*a*T]);
		const denominator = new Polynomial([1, T]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
