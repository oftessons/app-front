import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogResultadoSimuladoComponent } from './dialog-resultado-simulado.component';

describe('DialogResultadoSimuladoComponent', () => {
  let component: DialogResultadoSimuladoComponent;
  let fixture: ComponentFixture<DialogResultadoSimuladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogResultadoSimuladoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogResultadoSimuladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
