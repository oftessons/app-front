import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoConcluidoComponent } from './pagamento-concluido.component';

describe('PagamentoConcluidoComponent', () => {
  let component: PagamentoConcluidoComponent;
  let fixture: ComponentFixture<PagamentoConcluidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagamentoConcluidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagamentoConcluidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
