import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistModeComponent } from './playlist-mode.component';

describe('PlaylistModeComponent', () => {
  let component: PlaylistModeComponent;
  let fixture: ComponentFixture<PlaylistModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
