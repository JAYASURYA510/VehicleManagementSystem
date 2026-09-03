import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';
import { AssignVehicleMstComponent } from './assign-vehicle-mst';

describe('AssignVehicleMstComponent', () => {
  let component: AssignVehicleMstComponent;
  let fixture: ComponentFixture<AssignVehicleMstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignVehicleMstComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ToastrService,
          useValue: {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignVehicleMstComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
