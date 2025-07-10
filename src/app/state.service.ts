import { Injectable, signal } from '@angular/core';
import { produce } from 'immer';

import { type TilesMode } from './common-type';

import { SimpleElement } from './simple-element/simple-element';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	#simpleElements = signal<readonly SimpleElement[]>([]);
	#tilesMode = signal<TilesMode>('HalfHorizontal');

	simpleElements = this.#simpleElements.asReadonly();
	tilesMode = this.#tilesMode.asReadonly();

	addSimpleElement(element: SimpleElement) {
		this.#simpleElements.update(elements => [...elements, element]);
	}

	updateSimpleElement(element: SimpleElement, characteristicIndex: number, characteristicValue: number) {
		const index = this.#simpleElements().findIndex(x => x === element);
		this.#simpleElements.update(produce(elements => {
			elements[index].characteristics[characteristicIndex].value = characteristicValue;
		}));
	}
	
	removeSimpleElement(element: SimpleElement) {
		this.#simpleElements.update(elements => elements.filter(x => x !== element));
	}

	setTilesMode(tilesMode: TilesMode) {
		this.#tilesMode.set(tilesMode);
	}
}
