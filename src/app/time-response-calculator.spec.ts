import { TimeResponseCalculator } from './time-response-calculator';

import { InputType } from './common-type';
import { TransferFunction } from './transfer-function';

describe('TimeResponseCalculator', () => {
	it('should create an instance', () => {
		expect(new TimeResponseCalculator(new TransferFunction(), InputType.Impulse)).toBeTruthy();
	});
});
