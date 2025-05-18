import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeGraphComponent } from './time-graph.component';

describe('TimeGraphComponent', () => {
	let component: TimeGraphComponent;
	let fixture: ComponentFixture<TimeGraphComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TimeGraphComponent],
		});
		fixture = TestBed.createComponent(TimeGraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
