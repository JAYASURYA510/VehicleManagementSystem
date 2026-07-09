import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppModule, Vehicle } from '../../core/models';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: { value: string | number; label: string }[];
  required?: boolean;
  tableColumn?: boolean;
  format?: 'currency' | 'date';
}

export interface ExpensePageConfig {
  title: string;
  apiPath: string;
  module: AppModule;
  fields: FieldConfig[];
  defaultItem: Record<string, unknown>;
}

@Component({
  selector: 'app-expense-page',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './expense-page.component.html',
  styleUrl: './expense-page.component.css'
})
export class ExpensePageComponent implements OnInit {
  @Input({ required: true }) config!: ExpensePageConfig;

  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  items = signal<Record<string, unknown>[]>([]);
  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  loading = signal(true);
  filterVehicleId = signal('');

  form = this.fb.group({});

  ngOnInit(): void {
    this.buildForm();
    this.api.get<Vehicle[]>('vehicles').subscribe(v => this.vehicles.set(v));
    this.loadItems();
  }

  get tableFields(): FieldConfig[] {
    return this.config.fields.filter(f => f.tableColumn !== false);
  }

  get canWrite(): boolean {
    return this.auth.hasPermission(this.config.module, 'Write');
  }

  get canEdit(): boolean {
    return this.auth.hasPermission(this.config.module, 'Edit');
  }

  buildForm(): void {
    const group: Record<string, unknown> = {};
    for (const field of this.config.fields) {
      const validators = field.required !== false ? [Validators.required] : [];
      group[field.key] = [this.config.defaultItem[field.key] ?? '', validators];
    }
    this.form = this.fb.group(group);
  }

  loadItems(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = {};
    if (this.filterVehicleId()) params['vehicleId'] = +this.filterVehicleId();

    this.api.get<Record<string, unknown>[]>(this.config.apiPath, params).subscribe({
      next: data => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(value: string): void {
    this.filterVehicleId.set(value);
    this.loadItems();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset(this.config.defaultItem);
    this.showForm.set(true);
  }

  openEdit(item: Record<string, unknown>): void {
    this.editingId.set(item['id'] as number);
    const patch: Record<string, unknown> = {};
    for (const field of this.config.fields) {
      let val = item[field.key];
      if (field.type === 'date' && val) {
        val = (val as string).substring(0, 10);
      }
      patch[field.key] = val;
    }
    this.form.patchValue(patch);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    const body = { ...this.form.getRawValue() };
    const id = this.editingId();

    if (id) {
      this.api.put(`${this.config.apiPath}/${id}`, { ...body, id }).subscribe(() => {
        this.closeForm();
        this.loadItems();
      });
    } else {
      this.api.post(this.config.apiPath, body).subscribe(() => {
        this.closeForm();
        this.loadItems();
      });
    }
  }

  deleteItem(id: number): void {
    if (!confirm('Are you sure you want to delete this record?')) return;
    this.api.delete(`${this.config.apiPath}/${id}`).subscribe(() => this.loadItems());
  }

  getVehicleReg(vehicleId: number): string {
    return this.vehicles().find(v => v.id === vehicleId)?.registrationNumber ?? String(vehicleId);
  }

  displayValue(item: Record<string, unknown>, field: FieldConfig): string | number | Date | null | undefined {
    if (field.key === 'vehicleId') return this.getVehicleReg(item['vehicleId'] as number);
    return item[field.key] as string | number | Date | null | undefined;
  }

  currencyValue(item: Record<string, unknown>, field: FieldConfig): string | number | null | undefined {
    const value = this.displayValue(item, field);
    return value instanceof Date ? value.toISOString() : (value as string | number | null | undefined);
  }

  dateValue(item: Record<string, unknown>, field: FieldConfig): string | number | Date | null | undefined {
    return this.displayValue(item, field);
  }

  getItemId(item: Record<string, unknown>): number {
    return Number(item['id']);
  }
}
