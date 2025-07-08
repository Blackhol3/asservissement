import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BodeGraphComponent } from './bode-graph.component';

import { TransferFunction } from '../transfer-function';

describe('TimeGraphComponent', () => {
	let component: BodeGraphComponent;
	let fixture: ComponentFixture<BodeGraphComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [BodeGraphComponent],
		});
		fixture = TestBed.createComponent(BodeGraphComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
