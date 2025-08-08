import { FrequentialResponseCalculator } from './frequential-response-calculator';

import { Polynomial } from './polynomial';
import { TransferFunction } from './transfer-function';

describe('FrequentialResponseCalculator', () => {
	it('should create an instance', () => {
		expect(new FrequentialResponseCalculator(new TransferFunction())).toBeTruthy();
	});

	it('should calculate the asymptotic changes', () => {
		const tf = new TransferFunction(
			[new Polynomial([1, 10]), new Polynomial([0, 20])],
			[new Polynomial([10, 500]), new Polynomial([30]), new Polynomial([0, 0, 1, 50])],
		);
		const calculator = new FrequentialResponseCalculator(tf);
		const result = calculator.getAsymptoticChanges();

		expect(result).toHaveSize(2);
		expect(result[0]).toEqual({w: 1/50, order: -2});
		expect(result[1]).toEqual({w: 1/10, order: 1});
	});
});
