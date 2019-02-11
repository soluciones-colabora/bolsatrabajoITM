import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferViewComponent } from './joboffer-view.component';

describe('JobofferViewComponent', () => {
  let component: JobofferViewComponent;
  let fixture: ComponentFixture<JobofferViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobofferViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobofferViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
