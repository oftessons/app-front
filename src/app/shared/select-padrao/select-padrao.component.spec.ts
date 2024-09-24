import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPadraoComponent } from './select-padrao.component';

describe('SelectPadraoComponent', () => {
  let component: SelectPadraoComponent;
  let fixture: ComponentFixture<SelectPadraoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectPadraoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPadraoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
