import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseProfileComponent } from './enterprise-profile.component';

describe('EnterpriseProfileComponent', () => {
  let component: EnterpriseProfileComponent;
  let fixture: ComponentFixture<EnterpriseProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
