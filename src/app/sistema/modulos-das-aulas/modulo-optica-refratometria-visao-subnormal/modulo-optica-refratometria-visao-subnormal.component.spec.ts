import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloOpticaRefratometriaVisaoSubnormalComponent } from './modulo-optica-refratometria-visao-subnormal.component';

describe('ModuloOpticaRefratometriaVisaoSubnormalComponent', () => {
  let component: ModuloOpticaRefratometriaVisaoSubnormalComponent;
  let fixture: ComponentFixture<ModuloOpticaRefratometriaVisaoSubnormalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloOpticaRefratometriaVisaoSubnormalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloOpticaRefratometriaVisaoSubnormalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
