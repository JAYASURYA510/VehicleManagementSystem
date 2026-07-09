import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppModule, Master } from '../../core/models';

@Component({
  selector: 'app-masters',
  imports: [ReactiveFormsModule],
  templateUrl: './masters.component.html',
  styleUrl: './masters.component.css'
})
export class MastersComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  masters = signal<Master[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  filterCategory = signal('');

  categories = ['FuelStation', 'TollPlaza', 'VehicleType', 'Workshop', 'InsuranceProvider', 'TyreBrand', 'ChargeType'];

  form = this.fb.group({
    category: ['', Validators.required],
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const params: Record<string, string> = {};
    if (this.filterCategory()) params['category'] = this.filterCategory();
    this.api.get<Master[]>('masters', params).subscribe(m => this.masters.set(m));
  }

  onFilterChange(cat: string): void {
    this.filterCategory.set(cat);
    this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(m: Master): void {
    this.editingId.set(m.id);
    this.form.patchValue(m);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    const body = { ...this.form.getRawValue(), isActive: true };
    const id = this.editingId();

    if (id) {
      this.api.put(`masters/${id}`, { ...body, id }).subscribe(() => { this.closeForm(); this.load(); });
    } else {
      this.api.post('masters', body).subscribe(() => { this.closeForm(); this.load(); });
    }
  }

  deleteMaster(id: number): void {
    if (!confirm('Delete this master record?')) return;
    this.api.delete(`masters/${id}`).subscribe(() => this.load());
  }

  get canWrite() { return this.auth.hasPermission(AppModule.Masters, 'Write'); }
  get canEdit() { return this.auth.hasPermission(AppModule.Masters, 'Edit'); }
}
