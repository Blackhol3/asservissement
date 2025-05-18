import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class PController extends SimpleElement {
	readonly name: string = 'Correcteur P';
	readonly characteristics: Characteristic[] = [
		{
			name: 'Gain proportionnel',
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
		const denominator = new Polynomial([1]);
		
		this._transferFunction = new TransferFunction([numerator], [denominator]);
	}
}
