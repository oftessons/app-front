import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloCatarataComponent } from './modulo-catarata.component';

describe('ModuloCatarataComponent', () => {
  let component: ModuloCatarataComponent;
  let fixture: ComponentFixture<ModuloCatarataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuloCatarataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloCatarataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
