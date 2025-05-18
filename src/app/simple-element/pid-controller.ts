import { type Characteristic, SimpleElement } from './simple-element'
import { Polynomial } from '../polynomial'
import { TransferFunction } from '../transfer-function'

export class PIDController extends SimpleElement {
	readonly name: string = 'Correcteur PID';
	readonly characteristics: Characteristic[] = [
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
	];
	
	constructor() {
		super();
		this.update();
	}

	update(): void {
		const Kp = this.characteristics[0].value;
		const Ti = this.characteristics[1].value;
		const Td = this.characteristics[2].value;
		
		const numerator = new Polynomial([Kp, Kp*Ti, Kp*Ti*Td]);
		const denominator = new Polynomial([0, Ti]);
		
		this._transferFunction = new TransferFunction([numerator], [denominator]);
	}
}
