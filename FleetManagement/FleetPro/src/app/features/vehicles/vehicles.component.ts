import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Vehicle } from '../../core/models';

@Component({
  selector: 'app-vehicles',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  filterVehicleId = '';
  filterFrom = '';
  filterTo = '';

  form = this.fb.group({
    registrationNumber: ['', Validators.required],
    vehicleType: ['Truck', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    driverName: ['', Validators.required]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<Vehicle[]>('vehicles', { activeOnly: false }).subscribe(v => this.vehicles.set(v));
  }

  filteredVehicles(): Vehicle[] {
    return this.vehicles();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ vehicleType: 'Truck', year: new Date().getFullYear() });
    this.showForm.set(true);
  }

  openEdit(v: Vehicle): void {
    this.editingId.set(v.id);
    this.form.patchValue(v);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (this.form.invalid) return;
    const body = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.api.put(`vehicles/${id}`, { ...body, id, isActive: true }).subscribe(() => { this.closeForm(); this.load(); });
    } else {
      this.api.post('vehicles', body).subscribe(() => { this.closeForm(); this.load(); });
    }
  }

  deleteVehicle(id: number): void {
    if (!confirm('Deactivate this vehicle?')) return;
    this.api.delete(`vehicles/${id}`).subscribe(() => this.load());
  }

  get canManage() { return this.auth.isAdminOrSuperAdmin(); }
}
