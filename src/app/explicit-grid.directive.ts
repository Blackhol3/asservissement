import { Directive, ElementRef, effect, input } from '@angular/core';

@Directive({
	selector: '[appExplicitGrid]',
})
export class ExplicitGridDirective {
	structure = input('1:1', {alias: 'appExplicitGrid'});
	arrayStructure: [number, number] = [1, 1];
	
	totalWidth: number = 0;
	totalHeight: number = 0;
	
	constructor(private el: ElementRef<HTMLElement>) {
		new ResizeObserver((entries) => this.onResize(entries)).observe(this.el.nativeElement);
		this.el.nativeElement.style.display = 'grid';
		effect(() => this.onChange());
	}
	
	resize() {
		const width = this.totalWidth / this.arrayStructure[1];
		const height = this.totalHeight / this.arrayStructure[0];
		
		for (const child of Array.from(this.el.nativeElement.children)) {
			(child as HTMLElement).style.width = width + 'px';
			(child as HTMLElement).style.height = height + 'px';
		}
	}
	
	onResize(entries: ResizeObserverEntry[]) {
		this.totalWidth = entries[0].contentRect.width;
		this.totalHeight = entries[0].contentRect.height;
		this.resize();
	}
	
	onChange() {
		this.arrayStructure = this.structure().split(':').map((str) => parseInt(str)) as [number, number];
		this.el.nativeElement.style.gridTemplateColumns = 'repeat(' + this.arrayStructure[1] + ', 1fr)';
		setTimeout(() => this.resize());
	}
}
