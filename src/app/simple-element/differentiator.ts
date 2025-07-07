import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class Differentiator extends SimpleElement {
	readonly name: string = 'Dérivateur';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Ordre',
			minValue: 1,
			step: 1,
			value: 1,
		},
	];
	
	get transferFunction() {
		const numerator = new Polynomial([...Array<number>(this.characteristics[0].value).fill(0), 1]);
		const denominator = new Polynomial([1]);
		
		return new TransferFunction([numerator], [denominator]);
	}
}
