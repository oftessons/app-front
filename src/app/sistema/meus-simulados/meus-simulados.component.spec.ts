import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeusSimuladosComponent } from './meus-simulados.component';

describe('MeusSimuladosComponent', () => {
  let component: MeusSimuladosComponent;
  let fixture: ComponentFixture<MeusSimuladosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeusSimuladosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeusSimuladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
