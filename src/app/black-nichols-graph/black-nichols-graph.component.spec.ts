import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackNicholsGraphComponent } from './black-nichols-graph.component';

describe('BlackNicholsGraphComponent', () => {
  let component: BlackNicholsGraphComponent;
  let fixture: ComponentFixture<BlackNicholsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlackNicholsGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackNicholsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
