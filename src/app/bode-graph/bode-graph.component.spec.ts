import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodeGraphComponent } from './bode-graph.component';

describe('TimeGraphComponent', () => {
  let component: BodeGraphComponent;
  let fixture: ComponentFixture<BodeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodeGraphComponent ],
	  imports: [
	  ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
