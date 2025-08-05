import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphComponent } from './graph.component';

import { GraphOptions } from '../graph-options';

describe('GraphComponent', () => {
	let component: GraphComponent;
	let fixture: ComponentFixture<GraphComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [GraphComponent]
		});
		fixture = TestBed.createComponent(GraphComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('graphOptions', new GraphOptions());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
