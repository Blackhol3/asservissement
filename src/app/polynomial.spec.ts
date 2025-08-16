import { Polynomial } from './polynomial';

import { Complex } from './complex';

function expectArrayCloseTo(array1: readonly unknown[], array2: readonly number[], precision?: number) {
	expect(array1.length).toBe(array2.length);
	for (let i = 0; i < array1.length; ++i) {
		expect(array1[i]).toBeCloseTo(array2[i], precision);
	}
}

describe('Polynome', () => {
	it('should create an instance', () => {
		expect(new Polynomial()).toBeTruthy();
		expect(new Polynomial([10, 20])).toBeTruthy();
	});

	it('should read the coefficients', () => {
		let p = new Polynomial([10, 20, 30]);
		expect(p.at(0)).toBe(10);
		
		p = new Polynomial();
		expect(p.at(0)).toBe(0);
	});
	
	it('should calculate the order', () => {
		const p = new Polynomial([10, 20, 30]);
		expect(p.order).toBe(2);
	});
	
	it('should calculate the number of non-zero coefficients', () => {
		let p = new Polynomial([10, 0, 30, 0, 0, 60, 0]);
		expect(p.numberOfNonZeroCoefficients).toBe(3);
		
		p = new Polynomial([]);
		expect(p.numberOfNonZeroCoefficients).toBe(0);
	});
	
	it('should calculate the smaller non-zero coefficient', () => {
		let p = new Polynomial([10, 0, 30]);
		expect(p.smallerNonZeroCoefficient).toBe(0);
		
		p = new Polynomial([0, 0, 30, 0, 0, 60, 0]);
		expect(p.smallerNonZeroCoefficient).toBe(2);
		
		p = new Polynomial([]);
		expect(p.smallerNonZeroCoefficient).toBe(-1);
	});
	
	it('should change the coefficients', () => {
		const p = new Polynomial([10, 20]);
		let result = p.change(1, 200);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([10, 200]);
		
		result = p.change(5, 60);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([10, 20, 0, 0, 0, 60]);
	});
	
	it('should add', () => {
		const p1 = new Polynomial([10, 20, 30]);
		const p2 = new Polynomial([5, 7]);
		const result = p1.add(p2);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([15, 27, 30]);
	});
	
	it('should multiply by a scalar', () => {
		const p = new Polynomial([10, 20, 30]);
		const result = p.multiply(5);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([50, 100, 150]);
	});
	
	it('should multiply by another polynome', () => {
		const p1 = new Polynomial([10, 20, 30]);
		const p2 = new Polynomial([5, 7]);
		const result = p1.multiply(p2);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([50, 170, 290, 210]);
	});
	
	it('should power', () => {
		let p = new Polynomial([2, 5]);
		let result = p.power(3);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([8, 60, 150, 125]);
		
		p = new Polynomial([2, 5]);
		result = p.power(0);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([1]);
		
		expect(() => { p.power(-1); }).toThrowError();
		expect(() => { p.power(1.2); }).toThrowError();
	});

	it('should evaluate', () => {
		const p = new Polynomial([1, 2, 3, 4, 5]);
		const c = new Complex(3, 9);
		const result = p.evaluate(c);
		
		expect(result.real).toBe(8323);
		expect(result.imag).toBe(-40644);
	});

	it('should factorize', () => {
		const p1 = new Polynomial([2, 2, 1])
		const p2 = new Polynomial([10, 20]);
		const p3 = new Polynomial([0, 1, 2]);
		let result = p1.multiply(p2).multiply(p3).factorize();

		expect(result).toHaveSize(4);
		expectArrayCloseTo(result[0].coefficients, [0, 20], 6);
		expectArrayCloseTo(result[1].coefficients, [1, 2], 6);
		expectArrayCloseTo(result[2].coefficients, [1, 2], 6);
		expectArrayCloseTo(result[3].coefficients, [1, 1, 0.5], 6);

		result = p1.factorize();

		expect(result).toHaveSize(2);
		expectArrayCloseTo(result[0].coefficients, [2], 6);
		expectArrayCloseTo(result[1].coefficients, [1, 1, 0.5], 6);
	});
	
	it('should calculate the complex value', () => {
		const p = new Polynomial([1, 2, 3, 4, 5, 6]);
		const result = p.getComplexValue(10);
		
		expect(result.real).toBe(1 - 300 + 50000);
		expect(result.imag).toBe(20 - 4000 + 600000);
	});

	it('should calculate the multiplicative factor with another polynome', () => {
		let p1 = new Polynomial([10, 20, 30]);
		let p2 = new Polynomial([5, 7]);
		expect(p1.getFactor(p2)).toBe(null);

		p1 = new Polynomial([10, 20, 30]);
		p2 = new Polynomial([1, 2, 2]);
		expect(p1.getFactor(p2)).toBe(null);

		p1 = new Polynomial([10, 20, 30]);
		p2 = new Polynomial([1, 2, 3]);
		expect(p1.getFactor(p2)).toBe(10);

		p1 = new Polynomial([0, 0, 0.5, 1, 1.5]);
		p2 = new Polynomial([0, 0, 10, 20, 30]);
		expect(p1.getFactor(p2)).toBe(1/20);
	});
	
	it('should calculate the recursive polynomial', () => {
		const p = new Polynomial([2, 5, 7]);
		const result = p.getRecursivePolynomial(0.01);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([
			2 + 500 + 70000,
			-500 - 2*70000,
			70000
		]);
	});

	it('should calculate the characteristic frequency', () => {
		let p = new Polynomial([10]);
		expect(p.getCharacteristicFrequency()).toBe(null);

		p = new Polynomial([0, 0, 30]);
		expect(p.getCharacteristicFrequency()).toBe(null);

		p = new Polynomial([10, 20]);
		expect(p.getCharacteristicFrequency()).toBe(1/2);

		p = new Polynomial([0, 0.1, 0.2, 2.5]);
		expect(p.getCharacteristicFrequency()).toBe(1/5);
	});

	it('should calculate the roots', () => {
		const p1 = new Polynomial([2, 2, 1])
		const p2 = new Polynomial([10, 20]);
		const p3 = new Polynomial([0, 1, 2]);
		const p = p1.multiply(p2).multiply(p3);
		const result = p.getRoots().sort((a, b) => {
			const realDiff = a.real - b.real;
			return Math.abs(realDiff) > 1e-6 ? realDiff : a.imag - b.imag;
		});

		expect(result[0].real).toBeCloseTo(-1, 6);
		expect(result[0].imag).toBeCloseTo(-1, 6);

		expect(result[1].real).toBeCloseTo(-1, 6);
		expect(result[1].imag).toBeCloseTo(+1, 6);

		expect(result[2].real).toBeCloseTo(-0.5, 6);
		expect(result[2].imag).toBeCloseTo(0, 6);

		expect(result[3].real).toBeCloseTo(-0.5, 6);
		expect(result[3].imag).toBeCloseTo(0, 6);

		expect(result[4].real).toBeCloseTo(0, 6);
		expect(result[4].imag).toBeCloseTo(0, 6);
	});
});
