import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAdmin } from './news-admin';

describe('NewsAdmin', () => {
  let component: NewsAdmin;
  let fixture: ComponentFixture<NewsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
