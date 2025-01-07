import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloFarmacologiaComponent } from './modulo-farmacologia.component';

describe('ModuloFarmacologiaComponent', () => {
  let component: ModuloFarmacologiaComponent;
  let fixture: ComponentFixture<ModuloFarmacologiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloFarmacologiaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloFarmacologiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
