import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroDeAulasComponent } from './cadastro-de-aulas.component';

describe('CadastroDeAulasComponent', () => {
  let component: CadastroDeAulasComponent;
  let fixture: ComponentFixture<CadastroDeAulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroDeAulasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroDeAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
