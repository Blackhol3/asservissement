import { Injectable, effect, signal } from '@angular/core';
import { castDraft, produce } from 'immer';

import { type TilesMode } from './common-type';
import { type GraphOptions, GraphsOptions } from './graph-options';

import { SimpleElement, type SimpleElementType } from './simple-element/simple-element';
import { FirstOrder } from './simple-element/first-order';
import { SecondOrder } from './simple-element/second-order';
import { InverseFirstOrder } from './simple-element/inverse-first-order';
import { InverseSecondOrder } from './simple-element/inverse-second-order';
import { Integrator } from './simple-element/integrator';
import { Differentiator } from './simple-element/differentiator';
import { PController } from './simple-element/p-controller';
import { PIController } from './simple-element/pi-controller';
import { PIDController } from './simple-element/pid-controller';
import { PhaseLeadCompensator } from './simple-element/phase-lead-compensator';

type JSONState = ReturnType<InstanceType<typeof StateService>['toJSON']>;

async function toDeflate(string: string) {
	const stream = new Blob([string]).stream();
	const deflateStream = stream.pipeThrough(new CompressionStream('deflate-raw'));
	const bytes = new Uint8Array(await new Response(deflateStream).arrayBuffer());

	return bytes.toBase64({alphabet: 'base64url', omitPadding: true});
}

async function fromDeflate(string: string) {
	const bytes = Uint8Array.fromBase64(string, {alphabet: 'base64url'});
	const deflateStream = new Blob([bytes]).stream();
	const stream = deflateStream.pipeThrough(new DecompressionStream('deflate-raw'));

	return new Response(stream).json() as Promise<JSONState>;
}

async function copyToClipboard(string: string) {
	try {
		await navigator.permissions.query({name: 'clipboard-write' as never});
	}
	catch { /* empty */ }
	await navigator.clipboard.writeText(string);
}

const localStorageKey = 'asservissement';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	readonly simpleElementTypes = [
		new FirstOrder(),
		new SecondOrder(),
		new InverseFirstOrder(),
		new InverseSecondOrder(),
		new Integrator(),
		new Differentiator(),
		new PController(),
		new PIController(),
		new PIDController(),
		new PhaseLeadCompensator(),
	] as const;

	#simpleElements = signal<readonly SimpleElement[]>([]);
	#tilesMode = signal<TilesMode>('HalfHorizontal');
	#graphsOptions = signal(new GraphsOptions());

	simpleElements = this.#simpleElements.asReadonly();
	tilesMode = this.#tilesMode.asReadonly();
	graphsOptions = this.#graphsOptions.asReadonly();

	constructor() {
		effect(() => localStorage.setItem(localStorageKey, JSON.stringify(this.toJSON())));

		const url = new URL(window.location.href);
		const urlData = url.searchParams.get('data');
		if (urlData !== null) {
			url.searchParams.delete('data');
			history.replaceState(null, '', url.href);

			void fromDeflate(urlData).then(x => this.fromJSON(x));
			return;
		}
		
		const localStorageData = localStorage.getItem(localStorageKey);
		if (localStorageData !== null) {
			this.fromJSON(JSON.parse(localStorageData) as JSONState);
		}
	}

	addSimpleElement(type: SimpleElementType) {
		this.#simpleElements.update(elements => [...elements, new SimpleElement(type)]);
	}

	updateSimpleElement(element: SimpleElement, characteristicIndex: number, characteristicValue: number) {
		const index = this.#simpleElements().findIndex(x => x === element);
		this.#simpleElements.update(produce(elements => {
			elements[index].values[characteristicIndex] = characteristicValue;
		}));
	}
	
	removeSimpleElement(element: SimpleElement) {
		this.#simpleElements.update(elements => elements.filter(x => x !== element));
	}

	setTilesMode(tilesMode: TilesMode) {
		this.#tilesMode.set(tilesMode);
	}

	updateGraphOption<T extends 'loopType' | 'graphType' | 'inputType' | 'visualizationType'>(graphOptions: GraphOptions, option: T, value: GraphOptions[T]) {
		const index = this.#graphsOptions().findIndex(graphOptions);
		this.#graphsOptions.update(produce(graphsOptions => {
			const x = castDraft(graphsOptions.at(index));
			x[option] = value;
		}));
	}

	async copyToClipboard() {
		const string = JSON.stringify(this.toJSON());
		const deflate = await toDeflate(string);
		const url = new URL(window.location.href);
		url.searchParams.set('data', deflate);

		await copyToClipboard(url.href);
	}

	protected toJSON() {
		return {
			simpleElements: this.#simpleElements().map(element => element.toJSON()),
			tilesMode: this.#tilesMode(),
			graphsOptions: this.#graphsOptions().toJSON(),
		};
	}

	protected fromJSON(data: JSONState) {
		const simpleElements: SimpleElement[] = [];
		for (const element of data.simpleElements) {
			const elementType = this.simpleElementTypes.find(type => type.shortName === element[0]);
			if (elementType === undefined) {
				throw new Error(`"${element[0]}" is not a valid element type.`);
			}

			simpleElements.push(new SimpleElement(elementType, element.slice(1) as number[]))
		}
		
		this.#simpleElements.set(simpleElements);
		this.#tilesMode.set(data.tilesMode);
		this.#graphsOptions.set(GraphsOptions.fromJSON(data.graphsOptions));
	}
}
