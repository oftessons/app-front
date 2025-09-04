import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardsComponent } from './flashcards.component';

describe('FlashcardsComponent', () => {
  let component: FlashcardsComponent;
  let fixture: ComponentFixture<FlashcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashcardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
