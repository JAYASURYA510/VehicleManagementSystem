import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppModule, Permission, User, UserRole, Vehicle } from '../../core/models';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedVehicleIds = signal<number[]>([]);

  roles = [
    { value: UserRole.SuperAdmin, label: 'Super Admin' },
    { value: UserRole.Admin, label: 'Admin' },
    { value: UserRole.ManagingAuthority, label: 'Managing Authority' },
    { value: UserRole.User, label: 'User' }
  ];

  modules = Object.values(AppModule);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    fullName: ['', Validators.required],
    role: [UserRole.User as UserRole | string, Validators.required],
    isActive: [true],
    permissions: this.fb.array<FormGroup>([])
  });

  ngOnInit(): void {
    this.load();
    this.api.get<Vehicle[]>('vehicles').subscribe(v => this.vehicles.set(v));
  }

  get permissionsArray(): FormArray { return this.form.get('permissions') as FormArray; }

  load(): void { this.api.get<User[]>('users').subscribe(u => this.users.set(u)); }

  buildPermissions(existing?: Permission[]): void {
    this.permissionsArray.clear();
    for (const mod of this.modules) {
      const existingPerm = existing?.find(p => String(p.module) === String(mod));
      this.permissionsArray.push(this.fb.group({
        module: [mod],
        canView: [existingPerm?.canView ?? false],
        canRead: [existingPerm?.canRead ?? false],
        canWrite: [existingPerm?.canWrite ?? false],
        canEdit: [existingPerm?.canEdit ?? false]
      }));
    }
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ role: UserRole.User, isActive: true });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.selectedVehicleIds.set([]);
    this.buildPermissions();
    this.showForm.set(true);
  }

  openEdit(user: User): void {
    this.editingId.set(user.id);
    this.form.patchValue({
      username: user.username, email: user.email, fullName: user.fullName,
      role: user.role, isActive: user.isActive, password: ''
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.selectedVehicleIds.set(user.assignedVehicleIds ?? []);
    this.buildPermissions(user.permissions);
    this.showForm.set(true);
  }

  toggleVehicle(vehicleId: number, checked: boolean): void {
    const current = this.selectedVehicleIds();
    this.selectedVehicleIds.set(
      checked ? [...current, vehicleId] : current.filter(id => id !== vehicleId)
    );
  }

  isVehicleSelected(id: number): boolean {
    return this.selectedVehicleIds().includes(id);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const permissions = raw.permissions as Permission[];
    const assignedVehicleIds = this.selectedVehicleIds();
    const id = this.editingId();

    if (id) {
      this.api.put(`users/${id}`, {
        email: raw.email, fullName: raw.fullName, role: raw.role,
        isActive: raw.isActive, newPassword: raw.password || null,
        permissions, assignedVehicleIds
      }).subscribe(() => { this.closeForm(); this.load(); });
    } else {
      this.api.post('users', {
        username: raw.username, email: raw.email, password: raw.password,
        fullName: raw.fullName, role: raw.role, permissions, assignedVehicleIds
      }).subscribe(() => { this.closeForm(); this.load(); });
    }
  }

  deactivateUser(id: number): void {
    if (!confirm('Deactivate this user?')) return;
    this.api.delete(`users/${id}`).subscribe(() => this.load());
  }

  getRoleLabel(role: UserRole | string): string {
    const r = this.roles.find(x => x.value === role || UserRole[x.value] === role);
    return r?.label ?? String(role);
  }

  getVehicleNames(ids: number[]): string {
    return ids.map(id => this.vehicles().find(v => v.id === id)?.registrationNumber ?? id).join(', ') || '-';
  }

  get canManage() { return this.auth.isAdminOrSuperAdmin(); }
}
