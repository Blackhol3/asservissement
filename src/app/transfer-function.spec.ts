import { TransferFunction } from './transfer-function';
import { Polynomial } from './polynomial';

describe('TransferFunction', () => {
	it('should create an instance', () => {
		expect(new TransferFunction()).toBeTruthy();
	});
	
	it('should calculate the order', () => {
		const n1 = new Polynomial([10, 20, 30]);
		const n2 = new Polynomial([5, 7]);
		const n3 = new Polynomial([0, 5, 5, 7]);
		
		const d1 = new Polynomial([0, 0, 30]);
		const d2 = new Polynomial([0, 5, 7]);
		
		const tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		
		expect(tf.order).toEqual(-2);
	});
	
	it('should calculate the zero multiplicity', () => {
		const n1 = new Polynomial([10, 20, 30]);
		const n2 = new Polynomial([5, 7]);
		const n3 = new Polynomial([0, 5, 5, 7]);
		
		const d1 = new Polynomial([0, 0, 30]);
		const d2 = new Polynomial([0, 5, 7]);
		
		const tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		
		expect(tf.zeroMultiplicity).toEqual(2);
	});

	it('should calculate the static gain', () => {
		const n1 = new Polynomial([10, 20, 30]);
		const n2 = new Polynomial([5, 7]);
		const n3 = new Polynomial([0, 5, 5, 7]);
		
		const d1 = new Polynomial([0, 0, 30]);
		const d2 = new Polynomial([0, 5, 7]);
		
		const tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		
		expect(tf.staticGain).toEqual(5/3);
	});
	
	it('should multiply by another transfer function', () => {
		const p1 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		const p2 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		const p3 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		const p4 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		const p5 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		const p6 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		
		let tf1 = new TransferFunction([p1, p2], [p3]);
		let tf2 = new TransferFunction([p4], [p5, p6]);
		
		let result = tf1.multiply(tf2);
		
		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerators).toEqual([p1, p2, p4]);
		expect(result.denominators).toEqual([p3, p5, p6]);

		const n1 = new Polynomial([10, 20, 30]);
		const n2 = new Polynomial([5, 7]);
		const n3 = new Polynomial([0, 5, 5, 7]);
		
		const d1 = new Polynomial([0, 5, 7]);
		const d2 = new Polynomial([1, 2, 3]);
		const d3 = new Polynomial([5, 10, 15]);

		tf1 = new TransferFunction([n1, n2], [d1]);
		tf2 = new TransferFunction([n3], [d2, d3]);

		result = tf1.multiply(tf2);

		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerators).toEqual([new Polynomial([10]), n2, n3]);
		expect(result.denominators).toEqual([d1, d3]);
	});
	
	it('should expand', () => {
		let n1 = new Polynomial([10, 20, 30]);
		const n2 = new Polynomial([5, 7]);
		const n3 = new Polynomial([5, 5, 7]);
		
		let d1 = new Polynomial([10, 20, 30]);
		const d2 = new Polynomial([5, 7]);
		
		let tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		let expandedTf = tf.getExpandedTransferFunction();
		
		expect(expandedTf.numerator).toEqual(n1.multiply(n2).multiply(n3));
		expect(expandedTf.denominator).toEqual(d1.multiply(d2));
		
		n1 = new Polynomial([0, 0, 30]);
		d1 = new Polynomial([0, 20]);
		
		tf = new TransferFunction([n1], [d1]);
		expandedTf = tf.getExpandedTransferFunction();
		
		expect(expandedTf.numerator.coefficients).toEqual([0, 30]);
		expect(expandedTf.denominator.coefficients).toEqual([20]);
		
		tf = new TransferFunction();
		expandedTf = tf.getExpandedTransferFunction();
		
		expect(expandedTf.numerator).toEqual(new Polynomial([1]));
		expect(expandedTf.denominator).toEqual(new Polynomial([1]));
	});
	
	it('should calculate the closed-loop transfer function', () => {
		const tf = new TransferFunction([new Polynomial([3]), new Polynomial([1, 5])], [new Polynomial([2, 5, 7])]);
		const result = tf.getClosedLoopTransferFunction();
		
		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerator.coefficients).toEqual([3, 15]);
		expect(result.denominator.coefficients).toEqual([5, 20, 7]);
	});
	
	it('should calculate the recursive transfer function', () => {
		const tf = new TransferFunction([new Polynomial([3]), new Polynomial([1, 5])], [new Polynomial([2, 5, 7])]);
		const result = tf.getRecursiveTransferFunction(0.01);
		
		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerator.coefficients).toEqual([
			(3 + 1500) / (2 + 500 + 70000),
			-1500 / (2 + 500 + 70000)
		]);
		expect(result.denominator.coefficients).toEqual([
			1,
			(-500 - 2*70000) / (2 + 500 + 70000),
			70000 / (2 + 500 + 70000)
		]);
	});
});
