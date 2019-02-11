import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoboffersAdminComponent } from './joboffers-admin.component';

describe('JoboffersAdminComponent', () => {
  let component: JoboffersAdminComponent;
  let fixture: ComponentFixture<JoboffersAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoboffersAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoboffersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
