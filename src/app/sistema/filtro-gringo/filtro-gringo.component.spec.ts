import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroGringoComponent } from './filtro-gringo.component';

describe('FiltroGringoComponent', () => {
  let component: FiltroGringoComponent;
  let fixture: ComponentFixture<FiltroGringoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltroGringoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltroGringoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
