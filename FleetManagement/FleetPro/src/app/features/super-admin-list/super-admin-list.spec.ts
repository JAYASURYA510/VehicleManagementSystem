import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminList } from './super-admin-list';

describe('SuperAdminList', () => {
  let component: SuperAdminList;
  let fixture: ComponentFixture<SuperAdminList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminList],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
