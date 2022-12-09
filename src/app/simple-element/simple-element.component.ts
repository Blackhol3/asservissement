import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SimpleElement } from './simple-element'

@Component({
	selector: 'app-simple-element',
	templateUrl: './simple-element.component.html',
	styleUrls: ['./simple-element.component.scss']
})
export class SimpleElementComponent {
	@Input() simpleElement?: SimpleElement;
	@Output() simpleElementChange = new EventEmitter<SimpleElement>();
	
	@Output() change = new EventEmitter<void>();
	@Output() remove = new EventEmitter<void>();
	
	update(): void {
		this.simpleElement!.update();
		this.change.emit();
	}
}
