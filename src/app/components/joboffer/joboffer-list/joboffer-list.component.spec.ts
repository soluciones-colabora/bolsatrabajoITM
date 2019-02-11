import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferListComponent } from './joboffer-list.component';

describe('JobofferListComponent', () => {
  let component: JobofferListComponent;
  let fixture: ComponentFixture<JobofferListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobofferListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobofferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
