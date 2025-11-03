import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemaFlashcardsComponent } from './tema-flashcards.component';

describe('TemaFlashcardsComponent', () => {
  let component: TemaFlashcardsComponent;
  let fixture: ComponentFixture<TemaFlashcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemaFlashcardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemaFlashcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
