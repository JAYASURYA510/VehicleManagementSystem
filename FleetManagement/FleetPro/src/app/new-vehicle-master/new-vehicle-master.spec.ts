import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVehicleMaster } from './new-vehicle-master';

describe('NewVehicleMaster', () => {
  let component: NewVehicleMaster;
  let fixture: ComponentFixture<NewVehicleMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewVehicleMaster],
    }).compileComponents();

    fixture = TestBed.createComponent(NewVehicleMaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
