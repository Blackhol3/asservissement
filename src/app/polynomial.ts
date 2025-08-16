import { Complex } from './complex';

function productOfDifferences(values: Complex[], index: number) {
	let result = new Complex(1, 0);
	for (let i = 0; i < values.length; ++i) {
		if (i !== index) {
			result = values[index].substract(values[i]).multiply(result);
		}
	}

	return result;
}

export class Polynomial {
	constructor(readonly coefficients: readonly number[] = []) {
		if (this.coefficients.length === 0) {
			this.coefficients = [0];
		}
	}

	at(index: number): number {
		return this.coefficients[index] ?? 0;
	}
	
	change(index: number, value: number): Polynomial {
		const coefficients = [...this.coefficients];
		for (let i = coefficients.length; i < index; ++i) {
			coefficients[i] = 0;
		}
		
		coefficients[index] = value;
		
		return new Polynomial(coefficients);
	}
	
	get order(): number {
		return this.coefficients.length - 1;
	}
	
	get numberOfNonZeroCoefficients(): number {
		return this.coefficients.reduce((accumulator, coefficient) => accumulator + (coefficient !== 0 ? 1 : 0), 0);
	}
	
	get smallerNonZeroCoefficient(): number {
		return this.coefficients.findIndex((coefficient) => coefficient !== 0);
	}
	
	add(polynome: Polynomial): Polynomial {
		const coefficients = [...this.coefficients];
		polynome.coefficients.forEach((value, order) => {
			coefficients[order] ??= 0
			coefficients[order] += value;
		});
		
		return new Polynomial(coefficients);
	}
	
	multiply(factor: number | Polynomial): Polynomial {
		const coefficients = [0];
		this.coefficients.forEach((value1, order1) => {
			if (typeof factor === "number") {
				coefficients[order1] = factor * value1;
			}
			else {
				factor.coefficients.forEach((value2, order2) => {
					coefficients[order1 + order2] = (coefficients[order1 + order2] ?? 0) + value1 * value2;
				});
			}
		});
		
		return new Polynomial(coefficients);
	}
	
	power(exponant: number): Polynomial {
		if (!Number.isInteger(exponant) || exponant < 0) {
			throw new Error('The exponant should be a non-negative integer.');
		}
		
		let result = new Polynomial([1]);
		for (let i = 0; i < exponant; ++i) {
			result = result.multiply(this);
		}
		
		return result;
	}

	evaluate(x: Complex): Complex {
		let result = new Complex(0, 0);
		this.coefficients.forEach((value, order) => {
			result = x.power(order).multiply(value).add(result);
		});

		return result;
	}

	/** Factorize the polynomial, in ascending order of root moduli, with the first factor as a monomial and the others with a unit constant term */
	factorize(tolerance: number = 1e-6): Polynomial[] {
		const coefficient = this.at(this.smallerNonZeroCoefficient);
		if (this.smallerNonZeroCoefficient > 0) {
			return [
				new Polynomial(this.coefficients.slice(0, this.smallerNonZeroCoefficient + 1)),
				...new Polynomial(this.coefficients.slice(this.smallerNonZeroCoefficient)).multiply(1 / coefficient).factorize().slice(1),
			];
		}

		const roots = this.getRoots().sort((a, b) => a.abs - b.abs);
		const result = [new Polynomial([coefficient])];
		
		while (roots.length > 0) {
			const root = roots.shift()!;
			if (Math.abs(root.imag/root.real) < tolerance) {
				result.push(new Polynomial([1, -1/root.real]));
			}
			else {
				const inverseSquaredAbs = 1/(root.real**2 + root.imag**2);
				result.push(new Polynomial([1, -2*root.real*inverseSquaredAbs, inverseSquaredAbs]));
				
				const conjugateIndex = roots.findIndex(other => Math.abs((root.imag + other.imag)/root.real) < tolerance);
				roots.splice(conjugateIndex, 1);
			}
		}

		return result;
	}
	
	getComplexValue(w: number): Complex {
		let real = 0;
		let imaginary = 0;
		
		this.coefficients.forEach((value, order) => {
			const multipliedValue = value * Math.pow(w, order);
			
			switch (order % 4) {
				case 0:      real += multipliedValue; break;
				case 1: imaginary += multipliedValue; break;
				case 2:      real -= multipliedValue; break;
				case 3: imaginary -= multipliedValue; break;
			}
		});
		
		return new Complex(real, imaginary);
	}

	getFactor(polynome: Polynomial): number | null {
		if (this.order !== polynome.order) {
			return null;
		}

		const factor = this.at(this.smallerNonZeroCoefficient) / polynome.at(polynome.smallerNonZeroCoefficient);
		return this.coefficients.every((value, order) => value === factor * polynome.at(order)) ? factor : null;
	}
	
	getRecursivePolynomial(dt: number): Polynomial {
		let polynomial = new Polynomial();
		const derivationPolynome = new Polynomial([1, -1]);
		this.coefficients.forEach((value, order) => {
			polynomial = polynomial.add(derivationPolynome.power(order).multiply(value / Math.pow(dt, order)));
		});
		
		return polynomial;
	}

	getCharacteristicFrequency(): number | null {
		const realOrder = this.order - this.smallerNonZeroCoefficient;
		if (realOrder === 0) {
			return null;
		}
		
		return Math.pow(this.at(this.smallerNonZeroCoefficient) / this.at(this.order), 1/realOrder);
	}

	/** Find the polynomial's roots using the Durand–Kerner algorithm */
	getRoots(tolerance: number = 1e-6, maximumIterations: number = 30): Complex[] {
		const leadingCoefficient = this.at(this.order);
		if (leadingCoefficient !== 1) {
			return this.multiply(1 / leadingCoefficient).getRoots();
		}

		const initial = new Complex(0.3, 0.9);
		const roots: Complex[] = [];
		for (let i = 0; i < this.order; ++i) {
			roots.push(initial.power(i));
		}

		for (let j = 0; j < maximumIterations; ++j) {
			let maximumError = 0;

			for (let i = 0; i < roots.length; ++i) {
				const difference = this.evaluate(roots[i]).multiply(productOfDifferences(roots, i).invert());
				roots[i] = roots[i].substract(difference);

				const error = Math.abs(difference.abs / roots[i].abs);
				if (maximumError < error) {
					maximumError = error;
				}
			}

			if (maximumError < tolerance) {
				break;
			}
		}

		return roots;
	}
	
	getTex(laplaceVariable: string = 'p', maximumSignificantDigits: number = 3, maximumDigits: number = 4): string {
		let tex = '';
		this.coefficients.forEach((value, order) => {
			if (value === 0) {
				return;
			}
			
			let valueText = '';
			if (value !== 1) {
				const localeString = value.toLocaleString('en-US', {useGrouping: false, minimumSignificantDigits: 1, maximumSignificantDigits: maximumSignificantDigits});
				if (localeString.length > maximumDigits + (localeString.includes('.') ? 1 : 0)) {
					const exponent = Math.floor(Math.log10(value));
					valueText += (value / Math.pow(10, exponent)).toLocaleString(undefined, {minimumSignificantDigits: 1, maximumSignificantDigits: maximumSignificantDigits});
					valueText += ' \\cdot 10^{' + exponent + '}';
				}
				else {
					valueText += value.toLocaleString(undefined, {minimumSignificantDigits: 1, maximumSignificantDigits: maximumSignificantDigits});
				}
			}
			
			const orderText =
				(order === 0) ? '' :
				(order === 1) ? laplaceVariable :
				laplaceVariable + '^{' + order + '}'
			;
			
			if (value > 0) {
				tex += '+';
			}
			
			if (valueText === '' && orderText === '') {
				tex += '1';
			}
			else {
				tex += valueText + orderText;
			}
		});
		
		return tex.slice(1);
	}
}
