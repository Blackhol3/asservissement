export class Polynomial {
	constructor(private readonly _coefficients: number[] = []) {
		if (this._coefficients.length === 0) {
			this._coefficients = [0];
		}
	}
	
	get coefficients(): number[] {
		return this._coefficients;
	}

	at(index: number): number {
		return this._coefficients[index] ?? 0;
	}
	
	change(index: number, value: number): Polynomial {
		const coefficients = [...this._coefficients];
		for (let i = coefficients.length; i < index; ++i) {
			coefficients[i] = 0;
		}
		
		coefficients[index] = value;
		
		return new Polynomial(coefficients);
	}
	
	get order(): number {
		return this._coefficients.length - 1;
	}
	
	get numberOfNonZeroCoefficients(): number {
		return this._coefficients.reduce((accumulator, coefficient) => accumulator + (coefficient !== 0 ? 1 : 0), 0);
	}
	
	get smallerNonZeroCoefficient(): number {
		return this._coefficients.findIndex((coefficient) => coefficient !== 0);
	}
	
	add(polynome: Polynomial): Polynomial {
		const coefficients = [...this._coefficients];
		polynome._coefficients.forEach((value, order) => {
			coefficients[order] ??= 0
			coefficients[order] += value;
		});
		
		return new Polynomial(coefficients);
	}
	
	multiply(factor: number | Polynomial): Polynomial {
		const coefficients = [0];
		this._coefficients.forEach((value1, order1) => {
			if (typeof factor === "number") {
				coefficients[order1] = factor * value1;
			}
			else {
				factor._coefficients.forEach((value2, order2) => {
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
	
	getComplexValue(w: number): [number, number] {
		let real = 0;
		let imaginary = 0;
		
		this._coefficients.forEach((value, order) => {
			const multipliedValue = value * Math.pow(w, order);
			
			switch (order % 4) {
				case 0:      real += multipliedValue; break;
				case 1: imaginary += multipliedValue; break;
				case 2:      real -= multipliedValue; break;
				case 3: imaginary -= multipliedValue; break;
			}
		});
		
		return [real, imaginary];
	}

	getFactor(polynome: Polynomial): number | null {
		if (this.order !== polynome.order) {
			return null;
		}

		const factor = this.at(this.smallerNonZeroCoefficient) / polynome.at(polynome.smallerNonZeroCoefficient);
		return this._coefficients.every((value, order) => value === factor * polynome.at(order)) ? factor : null;
	}
	
	getRecursivePolynomial(dt: number): Polynomial {
		let polynomial = new Polynomial();
		const derivationPolynome = new Polynomial([1, -1]);
		this._coefficients.forEach((value, order) => {
			polynomial = polynomial.add(derivationPolynome.power(order).multiply(value / Math.pow(dt, order)));
		});
		
		return polynomial;
	}
	
	getTex(laplaceVariable: string = 'p', maximumSignificantDigits: number = 3, maximumDigits: number = 4): string {
		let tex = '';
		this._coefficients.forEach((value, order) => {
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
