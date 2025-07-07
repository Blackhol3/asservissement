import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class InverseFirstOrder extends SimpleElement {
	readonly name: string = 'Premier ordre inversé';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Gain statique',
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
	];
	
	get transferFunction() {
		const numerator = new Polynomial([this.characteristics[0].value, this.characteristics[0].value * this.characteristics[1].value]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
