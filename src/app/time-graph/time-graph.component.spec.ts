import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeGraphComponent } from './time-graph.component';

import { InputType } from '../common-type';
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
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		fixture.componentRef.setInput('inputType', InputType.Step);
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
