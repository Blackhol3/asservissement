import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeGraphComponent } from './time-graph.component';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsAnnotation from 'highcharts/modules/annotations';
HighchartsMore(Highcharts);
HighchartsAnnotation(Highcharts);

describe('TimeGraphComponent', () => {
  let component: TimeGraphComponent;
  let fixture: ComponentFixture<TimeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeGraphComponent ],
	  imports: [
		  MatSnackBarModule,
	  ],
    })
    .compileComponents();
	
	window.Highcharts = Highcharts;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
