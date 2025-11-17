import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloDeAulasComponent } from './modulo-de-aulas.component';

describe('ModuloDeAulasComponent', () => {
  let component: ModuloDeAulasComponent;
  let fixture: ComponentFixture<ModuloDeAulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloDeAulasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloDeAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
