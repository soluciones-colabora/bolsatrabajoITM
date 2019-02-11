import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferRegisterComponent } from './joboffer-register.component';

describe('JobofferRegisterComponent', () => {
  let component: JobofferRegisterComponent;
  let fixture: ComponentFixture<JobofferRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobofferRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobofferRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
