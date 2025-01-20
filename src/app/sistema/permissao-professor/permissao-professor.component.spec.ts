import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissaoProfessorComponent } from './permissao-professor.component';

describe('PermissaoProfessorComponent', () => {
  let component: PermissaoProfessorComponent;
  let fixture: ComponentFixture<PermissaoProfessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissaoProfessorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissaoProfessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
