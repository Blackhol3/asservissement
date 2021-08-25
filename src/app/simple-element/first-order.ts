import { Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class FirstOrder extends SimpleElement {
	readonly name: string = 'Premier ordre';
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
		const numerator = new Polynomial([this.characteristics[0].value]);
		const denominator = new Polynomial([1, this.characteristics[1].value]);
		
		this._transferFunction = new TransferFunction([numerator], [denominator]);
	}
}
