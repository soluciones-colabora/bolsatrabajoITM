import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferMainComponent } from './joboffer-main.component';

describe('JobofferMainComponent', () => {
  let component: JobofferMainComponent;
  let fixture: ComponentFixture<JobofferMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobofferMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobofferMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
