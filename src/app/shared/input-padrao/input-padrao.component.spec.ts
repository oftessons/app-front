import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPadraoComponent } from './input-padrao.component';

describe('InputPadraoComponent', () => {
  let component: InputPadraoComponent;
  let fixture: ComponentFixture<InputPadraoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputPadraoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputPadraoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
