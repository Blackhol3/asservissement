import { InputType } from './common-type';
import { TransferFunction } from './transfer-function';

export class TimeResponseCalculator {
	constructor(
		protected transferFunction: TransferFunction,
		protected inputType: InputType,
	) {}

	getResponse(tMin: number, tMax: number, dt: number, nbPoints: number) {
		const dtMin = (tMax - tMin)/(nbPoints - 1);
		dt = Math.min(dt, dtMin);
		
		const recursiveTransferFunction = this.transferFunction.getRecursiveTransferFunction(dt);
		const horizontalAsymptote = this.getAsymptote(tMin, tMax)[0];
		
		const input_memory = new Array<number>(recursiveTransferFunction.numerator.order + 1).fill(0);
		const output_memory = new Array<number>(recursiveTransferFunction.denominator.order).fill(0);
		
		const ts = [];
		const inputs = [];
		const outputs = [];
		const rapidity = {
			horizontalAsymptote: horizontalAsymptote,
			stabilizedArea: [horizontalAsymptote * 0.95, horizontalAsymptote * 1.05],
			wasInStabilizedArea: false,
			time: 0,
			value: 0,
		};
		
		for (let t = 0; t < tMax; t += dt) {
			const input = this.getInput(t, dt);
			
			input_memory.unshift(input);
			input_memory.pop();
			
			let output = 0;
			recursiveTransferFunction.numerator.coefficients.forEach((value, order) => {
				output += input_memory[order] * value;
			});
			recursiveTransferFunction.denominator.coefficients.forEach((value, order) => {
				if (order === 0) {
					return;
				}
				
				output -= output_memory[order - 1] * value;
			});
			
			if (t >= tMin && (ts.length === 0 || t >= ts[ts.length - 1] + dtMin)) {
				ts.push(t);
				inputs.push(input);
				outputs.push(output);
			}
			
			if (rapidity.wasInStabilizedArea === false && output >= rapidity.stabilizedArea[0] && output <= rapidity.stabilizedArea[1]) {
				rapidity.wasInStabilizedArea = true;
				rapidity.time = t;
				rapidity.value = output;
			}
			else if (rapidity.wasInStabilizedArea === true && (output < rapidity.stabilizedArea[0] || output > rapidity.stabilizedArea[1])) {
				rapidity.wasInStabilizedArea = false;
			}
			
			output_memory.unshift(output);
			output_memory.pop();
		}

		return {
			input: {
				x: [-0.001, 0, ...ts],
				y: [0, 0, ...inputs],
			},
			output: {
				x: [-0.001, 0, ...ts],
				y: [0, 0, ...outputs],
			},
			rapidity,
		};
	}

	protected getInput(t: number, dt: number): number {
		if (t < 0) {
			return 0;
		}
		
		if (this.inputType === InputType.Impulse) {
			return (t === 0) ? 1/dt : 0;
		}
			
		if (this.inputType === InputType.Step) {
			return 1;
		}
		
		if (this.inputType === InputType.Ramp) {
			return t;
		}
		
		throw new Error('No value associated with the selected input type.');
	}
	
	hasAsymptote(): boolean {
		return this.inputType + this.transferFunction.zeroMultiplicity <= 2;
	}
	
	hasHorizontalAsymptote(): boolean {
		return this.inputType + this.transferFunction.zeroMultiplicity <= 1;
	}
	
	getAsymptote(tMin: number, tMax: number): [number, number] {
		const expandedTransferFunction = this.transferFunction.getExpandedTransferFunction();
		const zeroMultiplicity = this.transferFunction.zeroMultiplicity;
		
		const values = [
			0,
			0,
			expandedTransferFunction.numerator.at(0) / expandedTransferFunction.denominator.at(zeroMultiplicity),
			(expandedTransferFunction.numerator.at(1)*expandedTransferFunction.denominator.at(zeroMultiplicity) - expandedTransferFunction.numerator.at(0)*expandedTransferFunction.denominator.at(zeroMultiplicity + 1)) / Math.pow(expandedTransferFunction.denominator.at(zeroMultiplicity), 2),
		];
		
		const A = values[this.inputType + zeroMultiplicity];
		const B = values[this.inputType + zeroMultiplicity + 1];
		
		return [
			A * tMin + B,
			A * tMax + B,
		];
	}
	
	hasTangent(): boolean {
		return this.transferFunction.order + this.inputType >= 2;
	}
	
	getTangent(tMin: number, tMax: number): [number, number] {
		if (this.transferFunction.order + this.inputType > 2) {
			return [0, 0];
		}
		
		const expandedTransferFunction = this.transferFunction.getExpandedTransferFunction();
		const A = expandedTransferFunction.numerator.at(expandedTransferFunction.numerator.order) / expandedTransferFunction.denominator.at(expandedTransferFunction.denominator.order);
		
		return [
			A * tMin,
			A * tMax,
		];
	}
}
