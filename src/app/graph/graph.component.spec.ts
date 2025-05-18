import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';

describe('GraphComponent', () => {
	let component: GraphComponent;
	let fixture: ComponentFixture<GraphComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [GraphComponent]
		});
		fixture = TestBed.createComponent(GraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
