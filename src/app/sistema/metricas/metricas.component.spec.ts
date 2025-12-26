import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricasComponent } from './metricas.component';

describe('MetricasComponent', () => {
  let component: MetricasComponent;
  let fixture: ComponentFixture<MetricasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
