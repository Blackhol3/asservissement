import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { TilesModes } from '../common-type';
import { StateService } from '../state.service';

import { GraphComponent } from '../graph/graph.component';

@Component({
	selector: 'app-graphs-grid',
	imports: [
		GraphComponent,
	],
	templateUrl: './graphs-grid.component.html',
	styleUrl: './graphs-grid.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphsGridComponent {
	readonly tilesStructure = computed(() => TilesModes[this.state.tilesMode()].structure);
	readonly tilesList = computed(() => new Array<never>(this.tilesStructure()[0] * this.tilesStructure()[1]));
	readonly #tilesStructure = toObservable(this.tilesStructure);

	protected totalWidth = 0;
	protected totalHeight = 0;

	constructor(
		readonly state: StateService,
		private readonly elementRef: ElementRef<HTMLElement>,
	) {
		new ResizeObserver(entries => this.onResize(entries)).observe(this.elementRef.nativeElement);
		this.#tilesStructure.subscribe(() => requestAnimationFrame(() => this.resize()));
	}

	resize() {
		const width = this.totalWidth / this.tilesStructure()[1];
		const height = this.totalHeight / this.tilesStructure()[0];
		
		for (const child of Array.from(this.elementRef.nativeElement.children)) {
			(child as HTMLElement).style.width = width + 'px';
			(child as HTMLElement).style.height = height + 'px';
		}
	}
	
	onResize(entries: ResizeObserverEntry[]) {
		this.totalWidth = entries[0].contentRect.width;
		this.totalHeight = entries[0].contentRect.height;
		this.resize();
	}

	@HostBinding('style.gridTemplateColumns') get gridTemplateColumns() { return `repeat(${this.tilesStructure()[1]}, 1fr)`; }
}
