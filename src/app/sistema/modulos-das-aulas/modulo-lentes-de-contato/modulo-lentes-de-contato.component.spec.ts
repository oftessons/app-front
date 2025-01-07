import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloLentesDeContatoComponent } from './modulo-lentes-de-contato.component';

describe('ModuloLentesDeContatoComponent', () => {
  let component: ModuloLentesDeContatoComponent;
  let fixture: ComponentFixture<ModuloLentesDeContatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloLentesDeContatoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloLentesDeContatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
