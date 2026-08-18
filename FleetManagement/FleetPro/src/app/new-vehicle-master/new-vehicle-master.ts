import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ApiService } from '../../app/core/services/api.service';



@Component({
  selector: 'app-new-vehicle-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
     
  ],
  templateUrl: './new-vehicle-master.html',
   styleUrl: './new-vehicle-master.css'
})
export class NewVehicleMaster implements OnInit {

  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  form = this.fb.group({

    // Default today's date
    date: [
      new Date().toISOString().substring(0, 10),
      Validators.required
    ],

    registrationNumber: [
      '',
      [
        
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9\s-]+$/)
      ]
    ],

    vehicleTypeId: [
      '',
      Validators.required
    ],

    vehicleCategory: [
      '',
      Validators.required
    ],

    make: [
      '',
      [
        // Validators.required,
        Validators.maxLength(50)
      ]
    ],

    model: [
      '',
      [
        // Validators.required,
        Validators.maxLength(50)
      ]
    ],

    chassisNumber: [
      '',
      [
        // Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9-]+$/)
      ]
    ],

    fuelTypeId: [
      '',
      Validators.required
    ],

    insurancePolicyNo: [
      '',
      Validators.maxLength(100)
    ],

    insuranceExpiryDate: [
      ''
    ],

    rcNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    fcNumber: [
      '',
      Validators.maxLength(50)
    ],

    fcDate: [
      ''
    ],

    vehicleStatusId: [
      '',
      Validators.required
    ],

    lastServiceDate: [
      ''
    ],

    isAvailable: [
      true
    ]

  });
onDateSelected(date: Date | null): void {

  if (!date) {
    console.log('Date cleared');
    return;
  }

  console.log('Selected date:', date);

  const formattedDate =
    date.toISOString().split('T')[0];

  console.log('API Date:', formattedDate);
}

  ngOnInit(): void {
  }


  save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const body = {
      ...this.form.getRawValue(),

      vehicleTypeId: Number(this.form.value.vehicleTypeId),
      vehicleCategory: Number(this.form.value.vehicleCategory),
      fuelTypeId: Number(this.form.value.fuelTypeId),
      vehicleStatusId: Number(this.form.value.vehicleStatusId)
    };

    console.log('Vehicle Master Payload:', body);

    this.api.post('vehicles', body).subscribe({

      next: () => {

        alert('Vehicle Saved Successfully');

        this.form.reset({

          date: new Date().toISOString().substring(0, 10),

          registrationNumber: '',
          vehicleTypeId: '',
          vehicleCategory: '',
          make: '',
          model: '',
          chassisNumber: '',
          fuelTypeId: '',

          insurancePolicyNo: '',
          insuranceExpiryDate: '',

          rcNumber: '',
          fcNumber: '',
          fcDate: '',

          vehicleStatusId: '',
          lastServiceDate: '',

          isAvailable: true

        });

      },

      error: (err) => {

        console.error(err);

        alert('Failed to save vehicle.');

      }

    });

  }

}