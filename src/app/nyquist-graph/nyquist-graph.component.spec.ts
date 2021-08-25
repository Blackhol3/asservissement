import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NyquistGraphComponent } from './nyquist-graph.component';

describe('NyquistGraphComponent', () => {
  let component: NyquistGraphComponent;
  let fixture: ComponentFixture<NyquistGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NyquistGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NyquistGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
