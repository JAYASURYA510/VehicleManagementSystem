import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryAdvance } from './salary-advance';

describe('SalaryAdvance', () => {
  let component: SalaryAdvance;
  let fixture: ComponentFixture<SalaryAdvance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryAdvance],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryAdvance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
