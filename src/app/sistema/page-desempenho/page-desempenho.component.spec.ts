import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDesempenhoComponent } from './page-desempenho.component';

describe('PageDesempenhoComponent', () => {
  let component: PageDesempenhoComponent;
  let fixture: ComponentFixture<PageDesempenhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageDesempenhoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDesempenhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
