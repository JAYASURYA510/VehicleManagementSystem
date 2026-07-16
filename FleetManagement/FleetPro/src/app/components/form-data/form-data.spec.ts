import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { FormDataComponent } from './form-data';

describe('FormDataComponent', () => {
  let component: FormDataComponent;
  let fixture: ComponentFixture<FormDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDataComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});