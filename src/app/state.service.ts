import { Injectable, effect, signal } from '@angular/core';
import { castDraft, produce } from 'immer';

import { type SeriesType, type TilesMode } from './common-type';
import { type GraphOptions, GraphsOptions } from './graph-options';

import { SimpleElement, type SimpleElementType } from './simple-element/simple-element';
import { SimpleElements } from './simple-elements';

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
	#simpleElements = signal(new SimpleElements());
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
		this.#simpleElements.update(elements => elements.add(type));
	}

	updateSimpleElement(element: SimpleElement, characteristicIndex: number, characteristicValue: number) {
		this.#simpleElements.update(elements => elements.update(element, characteristicIndex, characteristicValue));
	}
	
	removeSimpleElement(element: SimpleElement) {
		this.#simpleElements.update(elements => elements.remove(element));
	}

	setTilesMode(tilesMode: TilesMode) {
		this.#tilesMode.set(tilesMode);
	}

	updateGraphOption<T extends 'loopType' | 'graphType' | 'inputType' | 'visualizationType'>(graphOptions: GraphOptions, option: T, value: GraphOptions[T]) {
		const index = this.#graphsOptions().findIndex(graphOptions);
		this.#graphsOptions.update(produce(graphsOptions => {
			const x = graphsOptions.at(index);
			x[option] = value;
		}));
	}

	toggleSeriesVisibility(graphOptions: GraphOptions, type: SeriesType) {
		const index = this.#graphsOptions().findIndex(graphOptions);
		if (index === -1) {
			return;
		}

		this.#graphsOptions.update(produce(graphsOptions => {
			const x = castDraft(graphsOptions.at(index));
			if (x.visibleSeries.has(type)) {
				x.visibleSeries.delete(type);
			}
			else {
				x.visibleSeries.add(type);
			}
		}));
	}

	hideSeries(graphOptions: GraphOptions, type: SeriesType) {
		const index = this.#graphsOptions().findIndex(graphOptions);
		if (index === -1 || !this.#graphsOptions().at(index).visibleSeries.has(type)) {
			return;
		}

		this.#graphsOptions.update(produce(graphsOptions => {
			castDraft(graphsOptions.at(index)).visibleSeries.delete(type);
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
			simpleElements: this.#simpleElements().toJSON(),
			tilesMode: this.#tilesMode(),
			graphsOptions: this.#graphsOptions().toJSON(),
		};
	}

	protected fromJSON(data: JSONState) {
		this.#simpleElements.set(SimpleElements.fromJSON(data.simpleElements));
		this.#tilesMode.set(data.tilesMode);
		this.#graphsOptions.set(GraphsOptions.fromJSON(data.graphsOptions));
	}
}
