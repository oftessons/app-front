import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroQuestoesAmericanasComponent } from './cadastro-questoes-americanas.component';

describe('CadastroQuestoesAmericanasComponent', () => {
  let component: CadastroQuestoesAmericanasComponent;
  let fixture: ComponentFixture<CadastroQuestoesAmericanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroQuestoesAmericanasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroQuestoesAmericanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
