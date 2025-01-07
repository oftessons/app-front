import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloRetinaComponent } from './modulo-retina.component';

describe('ModuloRetinaComponent', () => {
  let component: ModuloRetinaComponent;
  let fixture: ComponentFixture<ModuloRetinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloRetinaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloRetinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
