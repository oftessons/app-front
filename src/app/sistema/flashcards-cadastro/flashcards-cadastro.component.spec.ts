import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardsCadastroComponent } from './flashcards-cadastro.component';

describe('FlashcardsCadastroComponent', () => {
  let component: FlashcardsCadastroComponent;
  let fixture: ComponentFixture<FlashcardsCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashcardsCadastroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashcardsCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
