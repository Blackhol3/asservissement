import { Complex } from './complex';

describe('Complex', () => {
	it('should calculate the polar coordinates', () => {
		const a = new Complex(3, 9);
		expect(a.abs).toBe(Math.sqrt(90));
		expect(a.theta).toBe(Math.atan2(9, 3));
		
		const b = new Complex(-3, 9);
		expect(b.abs).toBe(Math.sqrt(90));
		expect(b.theta).toBe(Math.atan2(9, -3));
	});

	it('should add and substract', () => {
		const a = new Complex(2, 9);
		const b = new Complex(3, 3);

		const add = a.add(b);
		expect(add.real).toBe(5);
		expect(add.imag).toBe(12);

		const sub = a.substract(b);
		expect(sub.real).toBe(-1);
		expect(sub.imag).toBe(6);
	});

	it('should multiply by a scalar', () => {
		const a = new Complex(3, 9);
		const result = a.multiply(3);
		
		expect(result.real).toBe(9);
		expect(result.imag).toBe(27);
	});
	
	it('should multiply by another complex', () => {
		const a = new Complex(3, 9);
		const b = new Complex(5, -3);
		const result = a.multiply(b);
		
		expect(result.real).toBe(42);
		expect(result.imag).toBe(36);
	});

	it('should power', () => {
		const a = new Complex(3, 9);
		const result = a.power(3);
		
		expect(result.real).toBeCloseTo(-702, 9);
		expect(result.imag).toBeCloseTo(-486, 9);
	});

	it('should invert', () => {
		const a = new Complex(3, 9);
		const result = a.invert();
		
		expect(result.real).toBe(1/30);
		expect(result.imag).toBe(-1/10);
	});
});
