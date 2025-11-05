import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfensivaComponent } from './ofensiva.component';

describe('OfensivaComponent', () => {
  let component: OfensivaComponent;
  let fixture: ComponentFixture<OfensivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfensivaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfensivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
