import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ApiService } from '../../app/core/services/api.service';
import { Vehicle } from '../../app/core/models';

@Component({
  selector: 'app-form-log-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './daily-log-report.html',
  styleUrl: './daily-log-report.css'
})
export class  DailyLogReport implements OnInit {

  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  vehicles = signal<Vehicle[]>([]);

  form = this.fb.group({
    vehicleId: ['', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],

    fuelStation: [''],
    dieselLitres: [0],
    dieselCost: [0],

    fromKm: [0, Validators.required],
    toKm: [0, Validators.required],
    kmBeforeFueling: [0],

    tollCharges: [0],
    // insuranceShare: [0],
    workshopExpenses: [0],
    tyreMaintenance: [0],

    driverSalary: [0],
    rtoCharges: [0],
    tripRevenue: [0],

    notes: ['']
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.api.get<Vehicle[]>('vehicles').subscribe({
      next: (data) => this.vehicles.set(data),
      error: (err) => console.error(err)
    });
  }

  save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = {
      ...this.form.getRawValue(),
      vehicleId: Number(this.form.value.vehicleId)
    };

    this.api.post('dailyRecords', body).subscribe({
      next: () => {
        alert('Record Saved Successfully');

        this.form.reset({
          date: new Date().toISOString().substring(0, 10),
          dieselLitres: 0,
          dieselCost: 0,
          fromKm: 0,
          toKm: 0,
          kmBeforeFueling: 0,
          tollCharges: 0,
          // insuranceShare: 0,
          workshopExpenses: 0,
          tyreMaintenance: 0,
          driverSalary: 0,
          rtoCharges: 0,
          tripRevenue: 0
        });
      },
      error: () => {
        alert('Failed to save record.');
      }
    });
  }

}