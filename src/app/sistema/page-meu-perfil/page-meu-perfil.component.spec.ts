import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMeuPerfilComponent } from './page-meu-perfil.component';

describe('PageMeuPerfilComponent', () => {
  let component: PageMeuPerfilComponent;
  let fixture: ComponentFixture<PageMeuPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageMeuPerfilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageMeuPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
