import { Polynomial } from './polynomial';

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
		let p = new Polynomial([10, 20, 30]);
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
		let p = new Polynomial([10, 20]);
		let result = p.change(1, 200);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([10, 200]);
		
		result = p.change(5, 60);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([10, 20, 0, 0, 0, 60]);
	});
	
	it('should add', () => {
		let p1 = new Polynomial([10, 20, 30]);
		let p2 = new Polynomial([5, 7]);
		let result = p1.add(p2);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([15, 27, 30]);
	});
	
	it('should multiply by a scalar', () => {
		let p = new Polynomial([10, 20, 30]);
		let result = p.multiply(5);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([50, 100, 150]);
	});
	
	it('should multiply by another polynome', () => {
		let p1 = new Polynomial([10, 20, 30]);
		let p2 = new Polynomial([5, 7]);
		let result = p1.multiply(p2);
		
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
	
	it('should calculate the complex value', () => {
		let p = new Polynomial([1, 2, 3, 4, 5, 6]);
		let result = p.getComplexValue(10);
		
		expect(result[0]).toBe(1 - 300 + 50000);
		expect(result[1]).toBe(20 - 4000 + 600000);
	});
	
	it('should calculate the recursive polynomial', () => {
		let p = new Polynomial([2, 5, 7]);
		let result = p.getRecursivePolynomial(0.01);
		
		expect(result).toBeInstanceOf(Polynomial);
		expect(result.coefficients).toEqual([
			2 + 500 + 70000,
			-500 - 2*70000,
			70000
		]);
	});
});
