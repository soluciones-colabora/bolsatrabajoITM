import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsAdminComponent } from './students-admin.component';

describe('StudentsAdminComponent', () => {
  let component: StudentsAdminComponent;
  let fixture: ComponentFixture<StudentsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
