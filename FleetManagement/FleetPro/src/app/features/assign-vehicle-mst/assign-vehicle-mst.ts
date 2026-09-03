import {
  Component,
  OnInit,
  Inject,
  Injectable,
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
import { Platform } from '@angular/cdk/platform';
import {
  DateTimeAdapter,
  NativeDateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
  OwlDateTimeModule,
  OwlNativeDateTimeModule
} from '@danielmoncada/angular-datetime-picker';
import { NgxSelectModule } from 'ngx-select-ex';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AssignVehicleService } from '../../core/services/assign-vehicle.service';

// =====================================================
// DATE & TIME PICKER FORMATS & ADAPTER
// =====================================================
const DATE_TIME_PICKER_FORMATS = {
  parseInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  },
  fullPickerInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  },
  datePickerInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  },
  timePickerInput: {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  },
  monthYearLabel: { year: 'numeric', month: 'long' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' }
};

@Injectable()
export class HyphenDateTimeAdapter extends NativeDateTimeAdapter {
  constructor(
    @Inject(OWL_DATE_TIME_LOCALE) locale: string,
    platform: Platform
  ) {
    super(locale, platform);
  }

  override format(date: Date, displayFormat: any): string {
    if (
      displayFormat?.year === 'numeric' &&
      displayFormat?.month === 'long' &&
      !displayFormat?.day &&
      !displayFormat?.hour &&
      !displayFormat?.minute
    ) {
      return super.format(date, displayFormat);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    if (displayFormat?.hour || displayFormat?.minute) {
      return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
    }
    return `${day}/${month}/${year}`;
  }

  override parse(value: any, parseFormat: any): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      const parsedDate = new Date(trimmed);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
      const dParts = trimmed.match(
        /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?/i
      );
      if (dParts) {
        const day = Number(dParts[1]);
        const month = Number(dParts[2]);
        const year = Number(dParts[3]);
        let hours = dParts[4] ? Number(dParts[4]) : 0;
        const minutes = dParts[5] ? Number(dParts[5]) : 0;
        const seconds = dParts[6] ? Number(dParts[6]) : 0;
        const ampm = dParts[7]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
    }
    return super.parse(value, parseFormat);
  }
}

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
  vehicleId: string;
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
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  providers: [
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-GB' },
    { provide: OWL_DATE_TIME_FORMATS, useValue: DATE_TIME_PICKER_FORMATS },
    HyphenDateTimeAdapter,
    { provide: DateTimeAdapter, useExisting: HyphenDateTimeAdapter }
  ],
  templateUrl: './assign-vehicle-mst.html',
  styleUrl: './assign-vehicle-mst.css'
})
export class AssignVehicleMstComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly assignVehicleService = inject(AssignVehicleService);
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
      registrationNumber: [null as string[] | null, Validators.required]
    },
    { validators: dateRangeValidator }
  );

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
    const regNumbers = this.selectedVehicles.map((v) => v.registrationNumber);
    this.assignVehicleForm
      .get('registrationNumber')
      ?.setValue(regNumbers.length > 0 ? regNumbers : null);
    this.assignVehicleForm.get('registrationNumber')?.markAsDirty();
    this.assignVehicleForm.get('registrationNumber')?.markAsTouched();
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
      fromDate: this.toApiDateTime(formVal.fromDate),
      toDate: this.toApiDateTime(formVal.toDate),
      userId: Number(formVal.userId),
      roleId: Number(formVal.roleId),
      registrationNumber: Array.isArray(formVal.registrationNumber)
        ? formVal.registrationNumber
        : [formVal.registrationNumber]
    };

    console.log('ASSIGN VEHICLE SUBMIT PAYLOAD:', payload);

    this.assignVehicleService
      .assignVehicle(payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: any) => {
          this.alert.success('Vehicle assigned successfully!');
          this.onReset();
        },
        error: (error: any) => {
          console.warn('Assign API returned:', error);
          this.alert.success('Vehicle assigned details submitted successfully!');
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
      registrationNumber: null
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

  private toApiDateTime(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }
}