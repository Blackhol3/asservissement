import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NyquistGraphComponent } from './nyquist-graph.component';

describe('NyquistGraphComponent', () => {
  let component: NyquistGraphComponent;
  let fixture: ComponentFixture<NyquistGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NyquistGraphComponent]
    });
    fixture = TestBed.createComponent(NyquistGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
