import { TransferFunction } from './transfer-function';
import { Polynomial } from './polynomial';

describe('TransferFunction', () => {
	it('should create an instance', () => {
		expect(new TransferFunction()).toBeTruthy();
	});
	
	it('should calculate the order', () => {
		let n1 = new Polynomial([10, 20, 30]);
		let n2 = new Polynomial([5, 7]);
		let n3 = new Polynomial([0, 5, 5, 7]);
		
		let d1 = new Polynomial([0, 0, 30]);
		let d2 = new Polynomial([0, 5, 7]);
		
		let tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		
		expect(tf.order).toEqual(-2);
	});
	
	it('should calculate the zero multiplicity', () => {
		let n1 = new Polynomial([10, 20, 30]);
		let n2 = new Polynomial([5, 7]);
		let n3 = new Polynomial([0, 5, 5, 7]);
		
		let d1 = new Polynomial([0, 0, 30]);
		let d2 = new Polynomial([0, 5, 7]);
		
		let tf = new TransferFunction([n1, n2, n3], [d1, d2]);
		
		expect(tf.zeroMultiplicity).toEqual(2);
	});
	
	it('should multiply by another transfer function', () => {
		let p1 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		let p2 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		let p3 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		let p4 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		let p5 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		let p6 = new Polynomial([Math.random(), Math.random(), Math.random()]);
		
		let tf1 = new TransferFunction([p1, p2], [p3]);
		let tf2 = new TransferFunction([p4], [p5, p6]);
		
		let result = tf1.multiply(tf2);
		
		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerators).toEqual([p1, p2, p4]);
		expect(result.denominators).toEqual([p3, p5, p6]);
	});
	
	it('should expand', () => {
		let n1 = new Polynomial([10, 20, 30]);
		let n2 = new Polynomial([5, 7]);
		let n3 = new Polynomial([5, 5, 7]);
		
		let d1 = new Polynomial([10, 20, 30]);
		let d2 = new Polynomial([5, 7]);
		
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
		let tf = new TransferFunction([new Polynomial([3]), new Polynomial([1, 5])], [new Polynomial([2, 5, 7])]);
		let result = tf.getClosedLoopTransferFunction();
		
		expect(result).toBeInstanceOf(TransferFunction);
		expect(result.numerator.coefficients).toEqual([3, 15]);
		expect(result.denominator.coefficients).toEqual([5, 20, 7]);
	});
	
	it('should calculate the recursive transfer function', () => {
		let tf = new TransferFunction([new Polynomial([3]), new Polynomial([1, 5])], [new Polynomial([2, 5, 7])]);
		let result = tf.getRecursiveTransferFunction(0.01);
		
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
