import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NyquistGraphComponent } from './nyquist-graph.component';

import { GraphOptions } from '../graph-options';
import { TransferFunction } from '../transfer-function';

describe('NyquistGraphComponent', () => {
	let component: NyquistGraphComponent;
	let fixture: ComponentFixture<NyquistGraphComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [NyquistGraphComponent]
		});
		fixture = TestBed.createComponent(NyquistGraphComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('graphOptions', new GraphOptions());
		fixture.componentRef.setInput('transferFunction', new TransferFunction());
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
