import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSimuladoComponent } from './page-simulado.component';

describe('PageSimuladoComponent', () => {
  let component: PageSimuladoComponent;
  let fixture: ComponentFixture<PageSimuladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageSimuladoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSimuladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
