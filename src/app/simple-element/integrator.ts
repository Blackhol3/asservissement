import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class Integrator extends SimpleElement {
	readonly name: string = 'Intégrateur';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Ordre',
			minValue: 1,
			step: 1,
			value: 1,
		},
	];

	get transferFunction() {
		const numerator = new Polynomial([1]);
		const denominator = new Polynomial([...Array<number>(this.characteristics[0].value).fill(0), 1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
