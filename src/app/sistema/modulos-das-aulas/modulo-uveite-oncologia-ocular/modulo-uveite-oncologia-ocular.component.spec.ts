import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloUveiteOncologiaOcularComponent } from './modulo-uveite-oncologia-ocular.component';

describe('ModuloUveiteOncologiaOcularComponent', () => {
  let component: ModuloUveiteOncologiaOcularComponent;
  let fixture: ComponentFixture<ModuloUveiteOncologiaOcularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloUveiteOncologiaOcularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloUveiteOncologiaOcularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
