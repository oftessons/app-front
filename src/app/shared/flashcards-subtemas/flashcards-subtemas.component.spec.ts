import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardsSubtemasComponent } from './flashcards-subtemas.component';

describe('FlashcardsSubtemasComponent', () => {
  let component: FlashcardsSubtemasComponent;
  let fixture: ComponentFixture<FlashcardsSubtemasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashcardsSubtemasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashcardsSubtemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
