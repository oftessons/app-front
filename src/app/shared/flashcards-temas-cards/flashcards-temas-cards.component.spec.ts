import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardsTemasCardsComponent } from './flashcards-temas-cards.component';

describe('FlashcardsTemasCardsComponent', () => {
  let component: FlashcardsTemasCardsComponent;
  let fixture: ComponentFixture<FlashcardsTemasCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashcardsTemasCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashcardsTemasCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
