import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMentoriaComponent } from './page-mentoria.component';

describe('PageMentoriaComponent', () => {
  let component: PageMentoriaComponent;
  let fixture: ComponentFixture<PageMentoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageMentoriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageMentoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
