import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlackNicholsGraphComponent } from './black-nichols-graph.component';

import { TransferFunction } from '../transfer-function';

describe('BlackNicholsGraphComponent', () => {
	let component: BlackNicholsGraphComponent;
	let fixture: ComponentFixture<BlackNicholsGraphComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [BlackNicholsGraphComponent]
		});
		fixture = TestBed.createComponent(BlackNicholsGraphComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
