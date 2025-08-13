import { SimpleElements, SimpleElementTypes } from './simple-elements';

import { FirstOrder } from './simple-element-type/first-order';
import { SimpleElement } from './simple-element/simple-element';

const firstOrder = new FirstOrder();

const e1 = new SimpleElement(firstOrder, [1, 2]);
const e2 = new SimpleElement(firstOrder, [3, 4]);
const e3 = new SimpleElement(firstOrder, [5, 6]);

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

	it('should calculate the tex output with more than one elements', () => {
		const simpleElements = new SimpleElements([e1, e2, e3]);
		const elementsTex = e1.transferFunction.getTex() + e2.transferFunction.getTex() + e3.transferFunction.getTex();
		const globalTex = simpleElements.transferFunction.getExpandedTransferFunction().getTex();
		const closedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${elementsTex}\\\\&= ${globalTex}`));
		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= ${closedLoopTex}`));
	});

	it('should calculate the tex output with one element', () => {
		const simpleElements = new SimpleElements([e1]);
		const closedLoopTex = simpleElements.transferFunction.getClosedLoopTransferFunction().getTex();

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= ${e1.transferFunction.getTex()}`));
		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= ${closedLoopTex}`));
	});

	it('should calculate the tex output with no elements', () => {
		const simpleElements = new SimpleElements([]);

		expect(simpleElements.transferFunctionTex).toEqual(getAlignedTex(`FTBO(p) &= \\frac11`));
		expect(simpleElements.transferFunctionClosedLoopTex).toEqual(getAlignedTex(`FTBF(p) &= \\frac12`));
	});
});
