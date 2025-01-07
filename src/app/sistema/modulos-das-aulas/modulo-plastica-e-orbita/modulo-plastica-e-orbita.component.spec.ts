import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloPlasticaEOrbitaComponent } from './modulo-plastica-e-orbita.component';

describe('ModuloPlasticaEOrbitaComponent', () => {
  let component: ModuloPlasticaEOrbitaComponent;
  let fixture: ComponentFixture<ModuloPlasticaEOrbitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloPlasticaEOrbitaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloPlasticaEOrbitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
