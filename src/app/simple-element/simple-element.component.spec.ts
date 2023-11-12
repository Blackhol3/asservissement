import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleElementComponent } from './simple-element.component';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

describe('SimpleElementComponent', () => {
  let component: SimpleElementComponent;
  let fixture: ComponentFixture<SimpleElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SimpleElementComponent,
        
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
