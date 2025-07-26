import { FrequentialResponseCalculator } from './frequential-response-calculator';
import { TransferFunction } from './transfer-function';

describe('FrequentialResponseCalculator', () => {
	it('should create an instance', () => {
		expect(new FrequentialResponseCalculator(new TransferFunction())).toBeTruthy();
	});
});
