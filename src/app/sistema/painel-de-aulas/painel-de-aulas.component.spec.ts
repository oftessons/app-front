import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelDeAulasComponent } from './painel-de-aulas.component';

describe('PainelDeAulasComponent', () => {
  let component: PainelDeAulasComponent;
  let fixture: ComponentFixture<PainelDeAulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PainelDeAulasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PainelDeAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
