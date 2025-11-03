import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SugestaoAlunoDialogComponent } from './sugestao-aluno-dialog.component';

describe('SugestaoAlunoDialogComponent', () => {
  let component: SugestaoAlunoDialogComponent;
  let fixture: ComponentFixture<SugestaoAlunoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SugestaoAlunoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SugestaoAlunoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
