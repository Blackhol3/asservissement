import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeGraphComponent } from './time-graph.component';

import { GraphOptions } from '../graph-options';
import { TransferFunction } from '../transfer-function';

describe('TimeGraphComponent', () => {
	let component: TimeGraphComponent;
	let fixture: ComponentFixture<TimeGraphComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [TimeGraphComponent],
		});
		fixture = TestBed.createComponent(TimeGraphComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('graphOptions', new GraphOptions());
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
