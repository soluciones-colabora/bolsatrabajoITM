import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseRegisterComponent } from './enterprise-register.component';

describe('EnterpriseRegisterComponent', () => {
  let component: EnterpriseRegisterComponent;
  let fixture: ComponentFixture<EnterpriseRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
