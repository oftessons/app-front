import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloGlaucomaComponent } from './modulo-glaucoma.component';

describe('ModuloGlaucomaComponent', () => {
  let component: ModuloGlaucomaComponent;
  let fixture: ComponentFixture<ModuloGlaucomaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloGlaucomaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloGlaucomaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
