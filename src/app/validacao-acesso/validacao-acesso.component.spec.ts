import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacaoAcessoComponent } from './validacao-acesso.component';

describe('ValidacaoAcessoComponent', () => {
  let component: ValidacaoAcessoComponent;
  let fixture: ComponentFixture<ValidacaoAcessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidacaoAcessoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidacaoAcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
