import { SimpleElement } from './simple-element';
import { Polynomial } from '../polynomial';
import { TransferFunction } from '../transfer-function';

export class PIDController extends SimpleElement {
	constructor() {
		super('Correcteur PID', [
			{
				name: 'Gain proportionnel',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
			{
				name: 'Constante de temps d\'intégration',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
			{
				name: 'Constante de temps de dérivation',
				minValue: 0.1,
				step: 0.1,
				value: 1,
			},
		]);
	}

	get transferFunction() {
		const Kp = this.characteristics[0].value;
		const Ti = this.characteristics[1].value;
		const Td = this.characteristics[2].value;
		
		const numerator = new Polynomial([Kp, Kp*Ti, Kp*Ti*Td]);
		const denominator = new Polynomial([0, Ti]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
