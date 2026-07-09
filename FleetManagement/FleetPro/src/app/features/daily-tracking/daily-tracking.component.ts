import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DailyRecordListItem, Vehicle } from '../../core/models';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-daily-tracking',
  imports: [ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './daily-tracking.component.html',
  styleUrl: './daily-tracking.component.css'
})
export class DailyTrackingComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  records = signal<DailyRecordListItem[]>([]);
  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  loading = signal(true);

  filterVehicleId = '';
  filterFrom = '';
  filterTo = '';

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
    insuranceShare: [0],
    workshopExpenses: [0],
    tyreMaintenance: [0],
    driverSalary: [0],
    rtoCharges: [0],
    tripRevenue: [0],
    notes: ['']
  });

  ngOnInit(): void {
    this.api.get<Vehicle[]>('vehicles').subscribe(v => this.vehicles.set(v));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = {};
    if (this.filterVehicleId) params['vehicleId'] = +this.filterVehicleId;
    if (this.filterFrom) params['from'] = this.filterFrom;
    if (this.filterTo) params['to'] = this.filterTo;

    this.api.get<DailyRecordListItem[]>('dailyRecords', params).subscribe({
      next: data => { this.records.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.form.reset({
      date: new Date().toISOString().substring(0, 10),
      dieselLitres: 0, dieselCost: 0, fromKm: 0, toKm: 0, kmBeforeFueling: 0,
      tollCharges: 0, insuranceShare: 0, workshopExpenses: 0, tyreMaintenance: 0,
      driverSalary: 0, rtoCharges: 0, tripRevenue: 0
    });
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (this.form.invalid) return;
    const body = { ...this.form.getRawValue(), vehicleId: +this.form.value.vehicleId! };
    this.api.post('dailyRecords', body).subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: () => alert('Failed to save record. Check vehicle access.')
    });
  }

  deleteRecord(id: number): void {
    if (!confirm('Delete this record?')) return;
    this.api.delete(`dailyRecords/${id}`).subscribe(() => this.load());
  }
}
