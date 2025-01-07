import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloEstrabismoEOftalmopedComponent } from './modulo-estrabismo-e-oftalmoped.component';

describe('ModuloEstrabismoEOftalmopedComponent', () => {
  let component: ModuloEstrabismoEOftalmopedComponent;
  let fixture: ComponentFixture<ModuloEstrabismoEOftalmopedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloEstrabismoEOftalmopedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloEstrabismoEOftalmopedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
