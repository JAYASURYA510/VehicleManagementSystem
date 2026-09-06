import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AssignVehicleService } from '../../core/services/assign-vehicle.service';
import { DateTimePickerService } from '../../core/services/datetime-picker.service';
import { DateTimePickerComponent } from '../../shared/datetime-picker/datetime-picker';

// =====================================================
// INTERFACES
// =====================================================
export interface User {
  userId: number;
  fullName: string;
  role: number;
}

export interface Role {
  id: number;
  roleName: string;
}

export interface Vehicle {
  vehicleId: any;
  registrationNumber: string;
}

// Date Range Validator
function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const fromDate = group.get('fromDate')?.value;
  const toDate = group.get('toDate')?.value;

  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-assign-vehicle-mst',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    DateTimePickerComponent
  ],
  templateUrl: './assign-vehicle-mst.html',
  styleUrl: './assign-vehicle-mst.css'
})
export class AssignVehicleMstComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly assignVehicleService = inject(AssignVehicleService);
  private readonly dateTimePickerService = inject(DateTimePickerService);
  private readonly alert = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  protected readonly unsubscribe$ = new Subject<void>();

  // =====================================================
  // API DATA LISTS
  // =====================================================
  userList: User[] = [];
  filteredUserList: User[] = [];
  roleList: Role[] = [];
  vehicleList: Vehicle[] = [];

  // =====================================================
  // VEHICLE REGISTRATION NUMBER CHECKBOX DROPDOWN
  // =====================================================
  vehicleDropdownOpen = false;
  selectedVehicles: Vehicle[] = [];
  vehicleSearchQuery = '';

  // =====================================================
  // FORM
  // =====================================================
  assignVehicleForm: FormGroup = this.fb.group(
    {
      fromDate: [null as Date | null, Validators.required],
      toDate: [null as Date | null, Validators.required],
      roleId: [null as number | null, Validators.required],
      userId: [null as number | null, Validators.required],
      vehicleId: [null, Validators.required]
    },
    { validators: dateRangeValidator }
  );
    
   localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');

  // =====================================================
  // INITIALIZATION
  // =====================================================
  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
    this.loadVehicles();
  }

  // =====================================================
  // LOAD USERS (API: User/getallUserForSelection)
  // =====================================================
  loadUsers(): void {
    this.assignVehicleService
      .getUsers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: any) => {
          if (response && Array.isArray(response.message)) {
            this.userList = response.message;
          } else if (Array.isArray(response)) {
            this.userList = response;
          } else {
            this.userList = [];
          }

          // If a role is already selected, filter users
          const currentRoleId = this.assignVehicleForm.get('roleId')?.value;
          if (currentRoleId !== null && currentRoleId !== undefined && currentRoleId !== '') {
            this.filteredUserList = this.userList.filter(
              (user) => Number(user.role) === Number(currentRoleId)
            );
          } else {
            this.filteredUserList = [...this.userList];
          }

          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Failed to load users:', error);
          this.alert.error('Failed to load users list');
          this.userList = [];
          this.filteredUserList = [];
        }
      });
  }

  // =====================================================
  // LOAD ROLES (API: UserRole/roleForLogin)
  // =====================================================
  loadRoles(): void {
    this.assignVehicleService
      .getRoles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.roleList = response;
          } else if (response && Array.isArray(response.message)) {
            this.roleList = response.message;
          } else {
            this.roleList = [];
          }
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Failed to load roles:', error);
          this.alert.error('Failed to load user roles');
          this.roleList = [];
        }
      });
  }

  // =====================================================
  // LOAD ACTIVE VEHICLES (API: VehicleMst/getActiveAllVehicle)
  // =====================================================
  loadVehicles(): void {
    this.assignVehicleService
      .getActiveVehicles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: any) => {
          if (response && Array.isArray(response.message)) {
            this.vehicleList = response.message;
          } else if (Array.isArray(response)) {
            this.vehicleList = response;
          } else {
            this.vehicleList = [];
          }
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Failed to load active vehicles:', error);
          this.alert.error('Failed to load active vehicles list');
          this.vehicleList = [];
        }
      });
  }

  // =====================================================
  // BIDIRECTIONAL LOGIC: USER DROPDOWN SELECTION
  // =====================================================
  onUserChange(event: any): void {
    const rawValue = this.extractValue(event);

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      const currentRoleId = this.assignVehicleForm.get('roleId')?.value;
      if (currentRoleId !== null && currentRoleId !== undefined && currentRoleId !== '') {
        this.filteredUserList = this.userList.filter(
          (u) => Number(u.role) === Number(currentRoleId)
        );
      } else {
        this.filteredUserList = [...this.userList];
      }
      return;
    }

    const userId = Number(rawValue);
    const selectedUser = this.userList.find(
      (u) => Number(u.userId) === userId
    );

    if (selectedUser) {
      const userRoleId = Number(selectedUser.role);

      // 1. Automatically set the corresponding role in the Role Dropdown
      const currentRoleId = this.assignVehicleForm.get('roleId')?.value;
      if (Number(currentRoleId) !== userRoleId) {
        this.assignVehicleForm.get('roleId')?.setValue(userRoleId, {
          emitEvent: false
        });
      }

      // 2. Filter users list to show all users with that role
      this.filteredUserList = this.userList.filter(
        (u) => Number(u.role) === userRoleId
      );
    }
  }

  // =====================================================
  // BIDIRECTIONAL LOGIC: ROLE DROPDOWN SELECTION
  // =====================================================
  onRoleChange(event: any): void {
    const rawValue = this.extractValue(event);

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      this.filteredUserList = [...this.userList];
      return;
    }

    const roleId = Number(rawValue);

    // 1. Filter User Dropdown to show only users belonging to the selected role
    this.filteredUserList = this.userList.filter(
      (u) => Number(u.role) === roleId
    );

    // 2. If the currently selected user does NOT belong to this role, clear user selection
    const currentUserId = this.assignVehicleForm.get('userId')?.value;
    if (currentUserId !== null && currentUserId !== undefined && currentUserId !== '') {
      const userMatchesRole = this.filteredUserList.some(
        (u) => Number(u.userId) === Number(currentUserId)
      );
      if (!userMatchesRole) {
        this.assignVehicleForm.get('userId')?.setValue(null, {
          emitEvent: false
        });
      }
    }
  }

  // =====================================================
  // VEHICLE REGISTRATION NUMBER CHECKBOX DROPDOWN LOGIC
  // =====================================================
  get filteredVehicleList(): Vehicle[] {
    if (!this.vehicleSearchQuery?.trim()) {
      return this.vehicleList;
    }
    const q = this.vehicleSearchQuery.toLowerCase().trim();
    return this.vehicleList.filter(
      (v) =>
        v.registrationNumber?.toLowerCase().includes(q) ||
        v.vehicleId?.toString().toLowerCase().includes(q)
    );
  }

  toggleVehicleDropdown(): void {
    this.vehicleDropdownOpen = !this.vehicleDropdownOpen;
  }

  isVehicleSelected(vehicle: Vehicle): boolean {
    return this.selectedVehicles.some(
      (v) =>
        v.registrationNumber === vehicle.registrationNumber ||
        (v.vehicleId && vehicle.vehicleId && v.vehicleId === vehicle.vehicleId)
    );
  }

  onVehicleCheckboxChange(event: any, vehicle: Vehicle): void {
    if (event.target.checked) {
      if (!this.isVehicleSelected(vehicle)) {
        this.selectedVehicles.push(vehicle);
      }
    } else {
      this.selectedVehicles = this.selectedVehicles.filter(
        (v) =>
          v.registrationNumber !== vehicle.registrationNumber &&
          v.vehicleId !== vehicle.vehicleId
      );
    }
    this.syncSelectedVehiclesWithForm();
  }

  selectAllVehicles(event: any): void {
    if (event.target.checked) {
      this.selectedVehicles = [...this.vehicleList];
    } else {
      this.selectedVehicles = [];
    }
    this.syncSelectedVehiclesWithForm();
  }

  isAllVehiclesSelected(): boolean {
    return (
      this.vehicleList.length > 0 &&
      this.selectedVehicles.length === this.vehicleList.length
    );
  }

  removeVehicle(vehicle: Vehicle): void {
    this.selectedVehicles = this.selectedVehicles.filter(
      (v) =>
        v.registrationNumber !== vehicle.registrationNumber &&
        v.vehicleId !== vehicle.vehicleId
    );
    this.syncSelectedVehiclesWithForm();
  }

  private syncSelectedVehiclesWithForm(): void {
    const vehicleIds = this.selectedVehicles.map((vehicle) => vehicle.vehicleId);
    this.assignVehicleForm
      .get('vehicleId')
      ?.setValue(vehicleIds.length > 0 ? vehicleIds : null);
    this.assignVehicleForm.get('vehicleId')?.markAsDirty();
    this.assignVehicleForm.get('vehicleId')?.markAsTouched();
  }

  getSelectedVehiclesHeaderDisplay(): string {
    if (this.selectedVehicles.length === 0) {
      return 'Select Vehicle Registration Number(s)';
    }
    if (this.selectedVehicles.length === 1) {
      return this.selectedVehicles[0].registrationNumber;
    }
    return `${this.selectedVehicles.length} Vehicles Selected`;
  }

  // Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const vehicleDropdownEl = this.elementRef.nativeElement.querySelector(
      '.vehicle-checkbox-dropdown'
    );
    if (vehicleDropdownEl && !vehicleDropdownEl.contains(event.target)) {
      this.vehicleDropdownOpen = false;
    }
  }

  // =====================================================
  // SUBMIT & RESET
  // =====================================================
  onSubmit(): void {
    if (this.assignVehicleForm.invalid) {
      this.assignVehicleForm.markAllAsTouched();
      this.alert.warning('Please fill in all required fields properly.');
      return;
    }

    const formVal = this.assignVehicleForm.value;
    const payload = {
      fromDate: this.dateTimePickerService.toApiDateTime(formVal.fromDate),
      toDate: this.dateTimePickerService.toApiDateTime(formVal.toDate),
      userId: Number(formVal.userId),
      roleId: Number(formVal.roleId),
      vehicleId: Array.isArray(formVal.vehicleId)? formVal.vehicleId : [formVal.vehicleId],
      isActive: true,
      created_date: this.dateTimePickerService.toApiDateTime(new Date()),
      createdBy: this.localStorageData.userId,
      updatedDate: this.dateTimePickerService.toApiDateTime(new Date()),
      updatedBy: this.localStorageData.userId
    };

    this.assignVehicleService.assignVehicle(payload).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (response: any) => {
          if(response.success == true){
          this.alert.success('Vehicle assigned successfully!');
          this.onReset();
          }
          else{
            this.alert.error('Failed to assign vehicle. Please try again.');
          }
        },
        error: (error: any) => {
          this.alert.error('Failed to assign vehicle. Please try again.');
          this.onReset();
        }
      });
  }

  onReset(): void {
    this.assignVehicleForm.reset({
      fromDate: null,
      toDate: null,
      userId: null,
      roleId: null,
      vehicleId: null
    });

    this.selectedVehicles = [];
    this.vehicleDropdownOpen = false;
    this.vehicleSearchQuery = '';
    this.filteredUserList = [...this.userList];
  }

  // =====================================================
  // HELPERS
  // =====================================================
  isInvalid(controlName: string): boolean {
    const control = this.assignVehicleForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  hasDateRangeError(): boolean {
    return (
      this.assignVehicleForm.hasError('dateRangeInvalid') &&
      !!(
        this.assignVehicleForm.get('fromDate')?.touched ||
        this.assignVehicleForm.get('toDate')?.touched
      )
    );
  }

  private extractValue(event: any): any {
    if (event === null || event === undefined) {
      return null;
    }
    if (Array.isArray(event)) {
      if (event.length === 0) return null;
      return event[0]?.value ?? event[0]?.id ?? event[0];
    }
    if (typeof event === 'object') {
      return event.value ?? event.id ?? event.userId ?? null;
    }
    return event;
  }

}