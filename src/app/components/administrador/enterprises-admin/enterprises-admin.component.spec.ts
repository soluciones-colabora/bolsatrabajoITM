import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterprisesAdminComponent } from './enterprises-admin.component';

describe('EnterprisesAdminComponent', () => {
  let component: EnterprisesAdminComponent;
  let fixture: ComponentFixture<EnterprisesAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterprisesAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterprisesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
