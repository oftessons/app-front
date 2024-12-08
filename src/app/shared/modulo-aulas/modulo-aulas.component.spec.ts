import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloAulasComponent } from './modulo-aulas.component';

describe('ModuloAulasComponent', () => {
  let component: ModuloAulasComponent;
  let fixture: ComponentFixture<ModuloAulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloAulasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
