import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageRevisaoComponent } from './page-revisao.component';

describe('PageRevisaoComponent', () => {
  let component: PageRevisaoComponent;
  let fixture: ComponentFixture<PageRevisaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageRevisaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageRevisaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
