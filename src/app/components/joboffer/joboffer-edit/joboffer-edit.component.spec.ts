import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferEditComponent } from './joboffer-edit.component';

describe('JobofferEditComponent', () => {
  let component: JobofferEditComponent;
  let fixture: ComponentFixture<JobofferEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobofferEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobofferEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
