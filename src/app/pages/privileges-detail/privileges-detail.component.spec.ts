import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegesDetailComponent } from './privileges-detail.component';

describe('PrivilegesDetailComponent', () => {
  let component: PrivilegesDetailComponent;
  let fixture: ComponentFixture<PrivilegesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivilegesDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivilegesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
