import { ChangeDetectorRef, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup, FormsModule, ValidationErrors } from '@angular/forms';
import { ApiService, Role } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppModule, Permission, User, UserRole, Vehicle } from '../../core/models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommanService } from '../../core/services/comman.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatFormField, MatSelect, MatOption } from "@angular/material/select";
import { AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatSelect,
    MatOption],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
  protected readonly unsubscribe$ = new Subject<void>();
  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');
  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  displayedColumns: string[] = [
  'id',
  'username',
  'fullName',
  'email',
  'role',
  'phoneNumber',
  'status',
  'actions'
];

dataSource = new MatTableDataSource<any>();

@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;

pageSize = 10;
get totalPages(): number {
  if (!this.paginator) return 0;

  return Math.ceil(
    this.paginator.length / this.paginator.pageSize
  );
}

get totalRecords(): number {
  return this.dataSource.data.length;
}

get startRecord(): number {
  if (!this.paginator) return 0;

  return this.paginator.pageIndex * this.paginator.pageSize + 1;
}

get endRecord(): number {
  if (!this.paginator) return 0;

  return Math.min(
    (this.paginator.pageIndex + 1) * this.paginator.pageSize,
    this.totalRecords
  );
}

constructor(
       private apiService : CommanService, private cdr: ChangeDetectorRef,
       private router : Router, private alert: ToastrService
    ) {}

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}

  users = signal<User[]>([]);
  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedVehicleIds = signal<number[]>([]);

  roles: UserRole[] = [];
  roleList : any;
  isSaveButton : any;
  isUpdateButton : any;

  modules = Object.values(AppModule);

  private readonly passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\|;'/]).+$/;

  private readonly passwordValidators = [
    Validators.minLength(8),
    Validators.pattern(this.passwordPattern)
  ];

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: [''],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    role: [null as number | null, Validators.required],
    isActive: [true],
    // permissions: this.fb.array<FormGroup>([])
  });

  ngOnInit(): void {
    this.load();
     this.getUserData();
    this.loadRoles();
    this.api.get<Vehicle[]>('vehicles').subscribe(v => this.vehicles.set(v));
  }

  loadRoles(): void {
    this.api.getRoles().subscribe({
      next: (res) => { this.roleList = [...res]; },
      error: (err) => { console.error('Roles API Error:', err); }
    });
  }

  // get permissionsArray(): FormArray { return this.form.get('permissions') as FormArray; }

  load(): void { this.api.get<User[]>('users').subscribe(u => this.users.set(u)); }
  
  
 changePageSize(size: number) {
  this.pageSize = size;
  this.paginator.pageSize = size;
  this.paginator.firstPage();

  this.dataSource.paginator = this.paginator;
}

  firstPage() {
  this.paginator.firstPage();
}

previousPage() {
  this.paginator.previousPage();
}

nextPage() {
  this.paginator.nextPage();
}

lastPage() {
  this.paginator.pageIndex = this.totalPages - 1;
  this.paginator._changePageSize(this.paginator.pageSize);
}


  openCreate(): void {
    this.isSaveButton = true;
    this.isUpdateButton = false;
    this.editingId.set(null);
    this.form.reset({ role: null, isActive: true });
    this.form.get('password')?.setValidators([Validators.required, ...this.passwordValidators]);
    this.form.get('password')?.updateValueAndValidity();
    this.selectedVehicleIds.set([]);
    this.showForm.set(true);
  }

  editedData: any;

  openEdit(user: User): void {
    this.isSaveButton = false;
    this.isUpdateButton = true;
    this.editedData = user;
    this.editingId.set(user.id);
    this.form.patchValue({
      username: user.username, email: user.emailId, fullName: user.fullName,
      role: typeof user.role === 'number' ? user.role : null,
      isActive: user.is_active, mobileNumber: user.phoneNumber
    });
    this.showForm.set(true);
  }

  updateUser(): void {
    var payload = {
        userId : this.editedData.userId,
        username : this.form.get("username")?.value,
        fullName : this.form.get("fullName")?.value,
        emailId : this.form.get("email")?.value,
        phoneNumber : this.form.get("mobileNumber")?.value,
        role : this.form.get("role")?.value,
        is_active : this.form.get("isActive")?.value,
        updatedBy : this.localStorageData.userId,
        updated_at : new Date().toISOString(),
    }

    this.apiService.update(`User/EditUser/${this.editedData.userId}`, payload).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any) =>{
      if(data){
       this.closeForm();
      this.getUserData();
      this.alert.success("User Updated Successfully");
      }
    },(error) => {
     this.alert.error("Unable to Update user");
    });
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

  applyFilter(event: Event) : void{
    const filterValue = (event.target as HTMLInputElement).value;

  this.dataSource.filter = filterValue.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
  }

  getUserData(){
   this.apiService.list(`User/getUser`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
    this.dataSource.data = data;
     if (this.paginator) {
        this.paginator.length = data.length;
      }
      });
  }
  closeForm(): void { this.showForm.set(false); }

  deleteUser(id: number): void {
     if(id != null){
          this.apiService.delete(`User/DeleteUser/${id}`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any) =>{
            this.getUserData();
            this.alert.success("User Deleted Successfully");
          },(error) => {
            this.alert.error("Unable to Delete user");
          });
    }
  }

  getRoleLabel(role: any | string | number): string {
     return UserRole[role];
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors) return '';

    const errors = control.errors as ValidationErrors;
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required.`;
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters.`;
    }
    if (errors['pattern']) {
      if (fieldName === 'password') {
        return 'Password must be at least 8 characters and include a special character.';
      }
      if (fieldName === 'mobileNumber') {
        return 'Enter a valid 10-digit mobile number starting with 6–9.';
      }
      if (fieldName === 'username') {
        return 'Username can only contain letters, numbers, and underscores.';
      }
      return `${this.getFieldLabel(fieldName)} format is invalid.`;
    }
    return `${this.getFieldLabel(fieldName)} is invalid.`;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      username: 'Username',
      email: 'Email',
      mobileNumber: 'Mobile Number',
      password: 'Password',
      fullName: 'Full Name',
      role: 'Role'
    };
    return labels[fieldName] ?? fieldName;
  }

  markFormTouched(): void {
    Object.values(this.form.controls).forEach((control: AbstractControl) => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  getVehicleNames(ids: number[]): string {
    return ids.map(id => this.vehicles().find(v => v.id === id)?.registrationNumber ?? id).join(', ') || '-';
  }

  get canManage() { return this.auth.isAdminOrSuperAdmin(); }
  onStatusChange(): void {
  const status = this.form.get('isActive')?.value;

}

get passwordValue(): string {
  return this.form.get('password')?.value || '';
}

hasMinLength(): boolean {
  return this.passwordValue.length >= 8;
}

hasUpperCase(): boolean {
  return /[A-Z]/.test(this.passwordValue);
}

hasLowerCase(): boolean {
  return /[a-z]/.test(this.passwordValue);
}

hasNumber(): boolean {
  return /\d/.test(this.passwordValue);
}

hasSpecialCharacter(): boolean {
  return /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\|;'/]/.test(this.passwordValue);
}
isPasswordValid(): boolean {
  return (
    this.hasMinLength() &&
    this.hasUpperCase() &&
    this.hasLowerCase() &&
    this.hasNumber() &&
    this.hasSpecialCharacter()
  );
}
saveData(): void {
  if (this.form.invalid) {
    this.markFormTouched();
    return;
  }

  const payload = {
     userId : 0,
     username : this.form.get("username")?.value,
     password : this.form.get("password")?.value,
     fullName : this.form.get("fullName")?.value,
     emailId : this.form.get("email")?.value,
     phoneNumber : this.form.get("mobileNumber")?.value,
     role : this.form.get("role")?.value,
     is_active : this.form.get("isActive")?.value,
     createdBy : this.localStorageData.userId,
     updatedBy : this.localStorageData.userId,
     created_at : new Date().toISOString(),
     updated_at : new Date().toISOString(),
  }

  this.apiService.create(`User/SaveUser`, payload).pipe(takeUntil(this.unsubscribe$)).subscribe((data) =>{
    this.closeForm();
    this.getUserData();
    this.alert.success("User Saved Successfully");
  },(error) => {
     this.alert.error("Unable to save user");
  });
  this.form.reset({ isActive: true, role: null });
  this.editingId.set(null);
}

resetForm(): void {
  this.form.reset({
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    fullName: '',
    role: null,
    isActive: true
  });
}
}
