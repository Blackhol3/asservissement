import { Polynomial } from './polynomial';

export class TransferFunction {
	constructor(readonly numerators: Polynomial[] = [], readonly denominators: Polynomial[] = []) {}
	
	get numerator(): Polynomial {
		if (this.numerators.length >= 2) {
			throw new Error('The numerator is not expanded.');
		}
		
		return this.numerators[0] ?? new Polynomial([1]);
	}
	
	get denominator(): Polynomial {
		if (this.denominators.length >= 2) {
			throw new Error('The denominator is not expanded.');
		}
		
		return this.denominators[0] ?? new Polynomial([1]);
	}
	
	get order(): number {
		let order = 0;
		
		this.numerators.forEach((value) => { order -= value.order; });
		this.denominators.forEach((value) => { order += value.order; });
		
		return order;
	}
	
	get zeroMultiplicity(): number {
		let zeroMultiplicity = 0;
		
		this.numerators.forEach((value) => { zeroMultiplicity -= value.smallerNonZeroCoefficient; });
		this.denominators.forEach((value) => { zeroMultiplicity += value.smallerNonZeroCoefficient; });
		
		return zeroMultiplicity;
	}
	
	multiply(factor: TransferFunction): TransferFunction {
		const numerators = [...this.numerators, ...factor.numerators];
		const denominators = [...this.denominators, ...factor.denominators];

		for (let i = 0; i < numerators.length; ++i) {
			for (let j = 0; j < denominators.length; ++j) {
				const factor = numerators[i].getFactor(denominators[j]);
				if (factor !== null) {
					numerators[i] = new Polynomial([factor]);
					denominators.splice(j, 1);
					break;
				}
			}
		}
		
		return new TransferFunction(numerators, denominators);
	}
	
	getExpandedTransferFunction(): TransferFunction {
		let expandedNumerator = new Polynomial([1]);
		let expandedDenominator = new Polynomial([1]);
		
		this.numerators.forEach((value) => { expandedNumerator = expandedNumerator.multiply(value); });
		this.denominators.forEach((value) => { expandedDenominator = expandedDenominator.multiply(value); });
		
		const simplificationOrder = Math.min(expandedNumerator.smallerNonZeroCoefficient, expandedDenominator.smallerNonZeroCoefficient);
		if (simplificationOrder > 0) {
			expandedNumerator = new Polynomial(expandedNumerator.coefficients.slice(simplificationOrder));
			expandedDenominator = new Polynomial(expandedDenominator.coefficients.slice(simplificationOrder));
		}
		
		return new TransferFunction([expandedNumerator], [expandedDenominator]);
	}
	
	getClosedLoopTransferFunction(): TransferFunction {
		const expandedTransferFunction = this.getExpandedTransferFunction();
		
		const numerator = expandedTransferFunction.numerator;
		const denominator = expandedTransferFunction.numerator.add(expandedTransferFunction.denominator);
		
		return new TransferFunction([numerator], [denominator]);
	}
	
	getRecursiveTransferFunction(dt: number): TransferFunction {
		const expandedTransferFunction = this.getExpandedTransferFunction();
		
		let numerator = expandedTransferFunction.numerator.getRecursivePolynomial(dt);
		let denominator = expandedTransferFunction.denominator.getRecursivePolynomial(dt);
		
		numerator = numerator.multiply(1 / denominator.at(0));
		denominator = denominator.multiply(1 / denominator.at(0));
		
		return new TransferFunction([numerator], [denominator]);
	}
	
	getTex(laplaceVariable?: string, maximumSignificantDigits?: number, maximumDigits?: number): string {
		const numeratorsTexs: string[] = [];
		this.numerators.forEach((value) => {
			let tex = value.getTex(laplaceVariable, maximumSignificantDigits, maximumDigits);
			if (this.numerators.length > 1 && value.numberOfNonZeroCoefficients > 1) {
				tex = '\\( ' + tex + ' \\)';
			}
			
			numeratorsTexs.push(tex);
		});
		
		const denominatorsTexs: string[] = [];
		this.denominators.forEach((value) => {
			let tex = value.getTex(laplaceVariable, maximumSignificantDigits, maximumDigits);
			if (this.denominators.length > 1 && value.numberOfNonZeroCoefficients > 1) {
				tex = '\\( ' + tex + ' \\)';
			}
			
			denominatorsTexs.push(tex);
		});
		
		return '\\frac{' + numeratorsTexs.join(' \\cdot ') + '}{' + denominatorsTexs.join(' \\cdot ') + '}';
	}
}
