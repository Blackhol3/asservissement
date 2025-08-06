import { immerable } from 'immer';
import { SimpleElementType } from '../simple-element-type/simple-element-type';

export class SimpleElement {
	[immerable] = true;
	readonly values: readonly number[];

	constructor(
		readonly type: SimpleElementType,
		values?: readonly number[],
	) {
		const defaultValues = this.type.getDefaultValues();
		if (values !== undefined && values.length !== defaultValues.length) {
			throw new Error('The number of values is not consistent with the element type.');
		}

		this.values = values ?? defaultValues;
	}

	get transferFunction() {
		return this.type.getTransferFunction(this.values);
	}

	toJSON() {
		return [this.type.shortName, ...this.values];
	}
}
