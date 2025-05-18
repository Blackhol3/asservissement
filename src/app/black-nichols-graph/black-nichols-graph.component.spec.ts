import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackNicholsGraphComponent } from './black-nichols-graph.component';

describe('BlackNicholsGraphComponent', () => {
	let component: BlackNicholsGraphComponent;
	let fixture: ComponentFixture<BlackNicholsGraphComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [BlackNicholsGraphComponent]
		});
		fixture = TestBed.createComponent(BlackNicholsGraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
