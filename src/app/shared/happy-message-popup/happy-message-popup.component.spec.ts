import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HappyMessagePopupComponent } from './happy-message-popup.component';

describe('HappyMessagePopupComponent', () => {
  let component: HappyMessagePopupComponent;
  let fixture: ComponentFixture<HappyMessagePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HappyMessagePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HappyMessagePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
