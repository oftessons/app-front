import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFiltroComponent } from './page-filtro.component';

describe('PageFiltroComponent', () => {
  let component: PageFiltroComponent;
  let fixture: ComponentFixture<PageFiltroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageFiltroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFiltroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
