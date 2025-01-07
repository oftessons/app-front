import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloCirurgiaRefrativaComponent } from './modulo-cirurgia-refrativa.component';

describe('ModuloCirurgiaRefrativaComponent', () => {
  let component: ModuloCirurgiaRefrativaComponent;
  let fixture: ComponentFixture<ModuloCirurgiaRefrativaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloCirurgiaRefrativaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloCirurgiaRefrativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
