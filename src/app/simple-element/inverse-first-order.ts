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
	
	constructor() {
		super();
		this.update();
	}

	update(): void {
		const numerator = new Polynomial([this.characteristics[0].value, this.characteristics[0].value * this.characteristics[1].value]);
		const denominator = new Polynomial([1]);
		
		this._transferFunction = new TransferFunction([numerator], [denominator]);
	}
}
