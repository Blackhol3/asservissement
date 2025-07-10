import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphsGridComponent } from './graphs-grid.component';

import { TransferFunction } from '../transfer-function';

describe('GraphsGridComponent', () => {
	let component: GraphsGridComponent;
	let fixture: ComponentFixture<GraphsGridComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GraphsGridComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(GraphsGridComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
