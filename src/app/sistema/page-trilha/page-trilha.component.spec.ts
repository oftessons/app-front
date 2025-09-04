import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTrilhaComponent } from './page-trilha.component';

describe('PageTrilhaComponent', () => {
  let component: PageTrilhaComponent;
  let fixture: ComponentFixture<PageTrilhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTrilhaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTrilhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
