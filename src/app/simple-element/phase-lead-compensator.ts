import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class PhaseLeadCompensator extends SimpleElement {
	readonly name: string = 'Correcteur à avance de phase';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Gain proportionnel',
			minValue: 0.1,
			step: 0.1,
			value: 1,
		},
		{
			name: 'Constante de temps',
			minValue: 0.1,
			step: 0.1,
			value: 1,
		},
		{
			name: 'Facteur d\'avance',
			minValue: 1,
			step: 0.1,
			value: 2,
		},
	];
	
	get transferFunction() {
		const K = this.characteristics[0].value;
		const T = this.characteristics[1].value;
		const a = this.characteristics[2].value;
		
		const numerator = new Polynomial([K, K*a*T]);
		const denominator = new Polynomial([1, T]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
