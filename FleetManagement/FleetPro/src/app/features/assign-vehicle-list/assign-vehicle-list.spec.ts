import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignVehicleList } from './assign-vehicle-list';

describe('AssignVehicleList', () => {
  let component: AssignVehicleList;
  let fixture: ComponentFixture<AssignVehicleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignVehicleList],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignVehicleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
