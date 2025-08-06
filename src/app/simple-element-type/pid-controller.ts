import { SimpleElementType } from './simple-element-type';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PIDController extends SimpleElementType {
	constructor() {
		super('Correcteur PID', 'PID', [
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
			{
				name: 'Constante de temps de dérivation',
				minValue: 0.1,
				step: 0.1,
				defaultValue: 1,
			},
		]);
	}

	getTransferFunction([Kp, Ti, Td]: [number, number, number]) {
		const numerator = new Polynomial([Kp, Kp*Ti, Kp*Ti*Td]);
		const denominator = new Polynomial([0, Ti]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
