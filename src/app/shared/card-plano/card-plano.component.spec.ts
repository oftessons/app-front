import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPlanoComponent } from './card-plano.component';

describe('CardPlanoComponent', () => {
  let component: CardPlanoComponent;
  let fixture: ComponentFixture<CardPlanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPlanoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
