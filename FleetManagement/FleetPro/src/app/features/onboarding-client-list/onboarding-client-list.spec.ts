import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingClientList } from './onboarding-client-list';

describe('OnboardingClientList', () => {
  let component: OnboardingClientList;
  let fixture: ComponentFixture<OnboardingClientList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingClientList],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingClientList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
