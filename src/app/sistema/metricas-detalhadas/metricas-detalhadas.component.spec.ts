import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricasDetalhadasComponent } from './metricas-detalhadas.component';

describe('MetricasDetalhadasComponent', () => {
  let component: MetricasDetalhadasComponent;
  let fixture: ComponentFixture<MetricasDetalhadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricasDetalhadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricasDetalhadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
