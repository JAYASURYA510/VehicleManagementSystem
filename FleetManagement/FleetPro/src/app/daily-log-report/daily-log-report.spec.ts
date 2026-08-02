import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLogReport } from './daily-log-report';

describe('DailyLogReport', () => {
  let component: DailyLogReport;
  let fixture: ComponentFixture<DailyLogReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLogReport],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyLogReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
