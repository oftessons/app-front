import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiploSelectComponent } from './multiplo-select.component';

describe('MultiploSelectComponent', () => {
  let component: MultiploSelectComponent;
  let fixture: ComponentFixture<MultiploSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiploSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiploSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
