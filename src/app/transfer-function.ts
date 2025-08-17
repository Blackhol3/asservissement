import { Polynomial } from './polynomial';

function getTexFromPolynomials(polynomials: readonly Polynomial[]) {
	polynomials = polynomials.filter(value => value.order > 0 || value.at(0) !== 1);
	return polynomials.length === 0 ? '1' : polynomials.map(value => {
		let tex = value.getTex();
		if (polynomials.length > 1 && value.numberOfNonZeroCoefficients > 1) {
			tex = '( ' + tex + ' )';
		}
		
		return tex;
	}).join(' ');
}

export class TransferFunction {
	constructor(readonly numerators: readonly Polynomial[] = [], readonly denominators: readonly Polynomial[] = []) {}
	
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
		
		this.numerators.forEach((value) => { zeroMultiplicity -= value.zeroMultiplicity; });
		this.denominators.forEach((value) => { zeroMultiplicity += value.zeroMultiplicity; });
		
		return zeroMultiplicity;
	}

	get staticGain(): number {
		let staticGain = 1;
		
		this.numerators.forEach((value) => { staticGain *= value.at(value.zeroMultiplicity); });
		this.denominators.forEach((value) => { staticGain /= value.at(value.zeroMultiplicity); });
		
		return staticGain;
	}
	
	multiply(factor: TransferFunction): TransferFunction {
		const numerators = [...this.numerators, ...factor.numerators];
		const denominators = [...this.denominators, ...factor.denominators];

		return new TransferFunction(numerators, denominators).simplify();
	}

	factorizeZero(): [TransferFunction, TransferFunction] {
		const numerators = this.numerator.factorizeZero();
		const denominators = this.denominator.factorizeZero();

		return [
			new TransferFunction([numerators[0]], [denominators[0]]),
			new TransferFunction([numerators[1]], [denominators[1]]),
		];
	}

	factorize(): TransferFunction {
		return new TransferFunction(this.numerator.factorize(), this.denominator.factorize()).simplify();
	}
	
	getExpandedTransferFunction(): TransferFunction {
		let expandedNumerator = new Polynomial([1]);
		let expandedDenominator = new Polynomial([1]);
		
		this.numerators.forEach((value) => { expandedNumerator = expandedNumerator.multiply(value); });
		this.denominators.forEach((value) => { expandedDenominator = expandedDenominator.multiply(value); });
		
		const simplificationOrder = Math.min(expandedNumerator.zeroMultiplicity, expandedDenominator.zeroMultiplicity);
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
	
	getTex(keepFractionIfUnitDenominator = true): string {
		const numeratorTex = getTexFromPolynomials(this.numerators);
		const denominatorTex = getTexFromPolynomials(this.denominators);

		return (keepFractionIfUnitDenominator || denominatorTex !== '1') ? `\\frac{${numeratorTex}}{${denominatorTex}}` : numeratorTex;
	}

	protected simplify(): TransferFunction {
		const numerators = [...this.numerators];
		const denominators = [...this.denominators];

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
}
