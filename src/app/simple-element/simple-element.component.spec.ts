import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstOrder } from '../simple-element-type/first-order';
import { SimpleElement } from './simple-element';
import { SimpleElementComponent } from './simple-element.component';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

describe('SimpleElementComponent', () => {
	let component: SimpleElementComponent;
	let fixture: ComponentFixture<SimpleElementComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [
				SimpleElementComponent,
        
				MatCardModule,
				MatFormFieldModule,
				MatIconModule,
			],
		});
		fixture = TestBed.createComponent(SimpleElementComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('simpleElement', new SimpleElement(new FirstOrder()));
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
