import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CadastroUsuariosComponent } from "./cadastro-de-usuarios.component";

describe('LoginComponent', () => {
  let component: CadastroUsuariosComponent;
  let fixture: ComponentFixture<CadastroUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroUsuariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
