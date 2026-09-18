import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewonboardClient } from './newonboard-client';

describe('NewonboardClient', () => {
  let component: NewonboardClient;
  let fixture: ComponentFixture<NewonboardClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewonboardClient],
    }).compileComponents();

    fixture = TestBed.createComponent(NewonboardClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
