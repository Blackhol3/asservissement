import { SimpleElements, SimpleElementTypes } from './simple-elements';

import { Differentiator } from './simple-element-type/differentiator';
import { FirstOrder } from './simple-element-type/first-order';
import { InverseFirstOrder } from './simple-element-type/inverse-first-order';
import { SimpleElement } from './simple-element/simple-element';

const differentiator = new Differentiator();
const firstOrder = new FirstOrder();
const inverseFirstOrder = new InverseFirstOrder();

const e1 = new SimpleElement(firstOrder, [1, 2]);
const e2 = new SimpleElement(firstOrder, [3, 4]);
const e3 = new SimpleElement(firstOrder, [5, 6]);
const e4 = new SimpleElement(inverseFirstOrder, [1, 2]);
const e5 = new SimpleElement(differentiator, [1]);

function getAlignedTex(tex: string) {
	return `\\begin{align}${tex}\\end{align}`;
}

describe('SimpleElementTypes', () => {
	it('should have unique names and short names', () => {
		const names = SimpleElementTypes.map(type => type.name);
		const shortNames = SimpleElementTypes.map(type => type.shortName);
		
		expect(names).toEqual([...new Set(names)]);
		expect(shortNames).toEqual([...new Set(shortNames)]);
	});
});

describe('SimpleElements', () => {
	it('should calculate the global transfer function', () => {
		const simpleElements = new SimpleElements([e1, e2, e3]);
		const transferFunction = e1.transferFunction.multiply(e2.transferFunction).multiply(e3.transferFunction);
		
		expect(simpleElements.transferFunction).toEqual(transferFunction);
	});

	it('should calculate the open-loop tex output with more than one elements simplifying with each other', () => {
		const simpleElements = new SimpleElements([e1, e4]);
		const elementsTex = e1.transferFunction.getTex() + e4.transferFunction.getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${elementsTex}\\\\&= 1`));
	});

	it('should calculate the open-loop tex output with more than one elements and no static gain', () => {
		const simpleElements = new SimpleElements([e1, e1, e1]);
		const elementsTex = e1.transferFunction.getTex() + e1.transferFunction.getTex() + e1.transferFunction.getTex();
		const globalTex = simpleElements.transferFunction.getExpandedTransferFunction().getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${elementsTex}\\\\&= ${globalTex}`));
	});

	it('should calculate the open-loop tex output with more than one elements and a differentiator', () => {
		const simpleElements = new SimpleElements([e2, e5]);
		const elementsTex = e2.transferFunction.getTex() + e5.transferFunction.getTex();
		const globalTex = '3p' + new SimpleElement(firstOrder, [1, 4]).transferFunction.getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${elementsTex}\\\\&= ${globalTex}`));
	});

	it('should calculate the closed-loop tex output with more than one elements', () => {
		const simpleElements = new SimpleElements([e1, e2, e3]);
		const closedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().getTex();
		const factorizedClosedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().factorize().getTex();

		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= ${closedLoopTex}\\\\&= ${factorizedClosedLoopTex}`));
	});

	it('should calculate the tex output with one element', () => {
		const simpleElements = new SimpleElements([e1]);
		const closedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().getTex();
		const factorizedClosedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().factorize().getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${e1.transferFunction.getTex()}`));
		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= ${closedLoopTex}\\\\&= ${factorizedClosedLoopTex}`));
	});

	it('should calculate the tex output with no elements', () => {
		const simpleElements = new SimpleElements([]);

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= \\frac11`));
		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= \\frac12`));
	});
});
