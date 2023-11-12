import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
	selector: '[appExplicitGrid]',
	standalone: true,
})
export class ExplicitGridDirective implements OnChanges {
	@Input('appExplicitGrid') structure: string = '1:1';
	arrayStructure: [number, number] = [1, 1];
	
	totalWidth: number = 0;
	totalHeight: number = 0;
	
	constructor(private el: ElementRef) {
		new ResizeObserver((entries) => this.onResize(entries)).observe(this.el.nativeElement);
		this.el.nativeElement.style.display = 'grid';
	}
	
	resize() {
		const width = this.totalWidth / this.arrayStructure[1];
		const height = this.totalHeight / this.arrayStructure[0];
		
		for (let child of Array.from(this.el.nativeElement.children)) {
			(child as HTMLElement).style.width = width + 'px';
			(child as HTMLElement).style.height = height + 'px';
		}
	}
	
	onResize(entries: ResizeObserverEntry[]) {
		this.totalWidth = entries[0].contentRect.width;
		this.totalHeight = entries[0].contentRect.height;
		this.resize();
	}
	
	ngOnChanges() {
		this.arrayStructure = this.structure.split(':').map((str) => parseInt(str)) as [number, number];
		this.el.nativeElement.style.gridTemplateColumns = 'repeat(' + this.arrayStructure[1] + ', 1fr)';
		setTimeout(() => this.resize());
	}
}
