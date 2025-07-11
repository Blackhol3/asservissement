import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphComponent } from './graph.component';

import { GraphOptions } from '../graph-options';
import { TransferFunction } from '../transfer-function';

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
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
