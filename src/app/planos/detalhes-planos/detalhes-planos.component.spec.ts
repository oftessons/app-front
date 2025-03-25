import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesPlanosComponent } from './detalhes-planos.component';

describe('DetalhesPlanosComponent', () => {
  let component: DetalhesPlanosComponent;
  let fixture: ComponentFixture<DetalhesPlanosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalhesPlanosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalhesPlanosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
