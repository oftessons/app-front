import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloCorneaConjutivaEscleraComponent } from './modulo-cornea-conjutiva-esclera.component';

describe('ModuloCorneaConjutivaEscleraComponent', () => {
  let component: ModuloCorneaConjutivaEscleraComponent;
  let fixture: ComponentFixture<ModuloCorneaConjutivaEscleraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloCorneaConjutivaEscleraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloCorneaConjutivaEscleraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
