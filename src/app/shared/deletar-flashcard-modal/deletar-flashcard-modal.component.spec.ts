import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletarFlashcardModalComponent } from './deletar-flashcard-modal.component';

describe('DeletarFlashcardModalComponent', () => {
  let component: DeletarFlashcardModalComponent;
  let fixture: ComponentFixture<DeletarFlashcardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletarFlashcardModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletarFlashcardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
