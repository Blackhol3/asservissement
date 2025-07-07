import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class InverseSecondOrder extends SimpleElement {
	readonly name: string = 'Second ordre inversé';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Gain statique',
			minValue: 0.1,
			step: 0.1,
			value: 1,
		},
		{
			name: 'Pulsation propre',
			minValue: 0.1,
			step: 0.1,
			value: 3,
		},
		{
			name: 'Amortissement',
			minValue: 0,
			step: 0.02,
			value: 1,
		},
	];

	get transferFunction() {
		const K = this.characteristics[0].value;
		const w0 = this.characteristics[1].value;
		const z = this.characteristics[2].value;
		
		const numerator = new Polynomial([K, 2*K*z/w0, K/(w0*w0)]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
