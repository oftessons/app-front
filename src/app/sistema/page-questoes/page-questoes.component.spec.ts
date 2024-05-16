import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageQuestoesComponent } from './page-questoes.component';

describe('PageQuestoesComponent', () => {
  let component: PageQuestoesComponent;
  let fixture: ComponentFixture<PageQuestoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageQuestoesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageQuestoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
