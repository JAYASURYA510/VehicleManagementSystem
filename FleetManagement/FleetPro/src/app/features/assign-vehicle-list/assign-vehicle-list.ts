import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AssignVehicleService } from '../../core/services/assign-vehicle.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DateTimePickerComponent } from '../../shared/datetime-picker/datetime-picker';
import { CommanService } from '../../core/services/comman.service';
import { NgxSelectModule } from 'ngx-select-ex';
import { User } from '../assign-vehicle-mst/assign-vehicle-mst';
import { Router } from '@angular/router';
import { DateTimePickerService } from '../../core/services/datetime-picker.service';
import { UserRole } from '../../core/models';

export interface VehicleAssignment {
  assignmentId: string;
  vehicleId: string;
  vehicleNumber: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
}

export interface AssignedVehicleUser {
  userId: number;
  userName: string;
  roleId: number;
  roleName: string;
  assignments: VehicleAssignment[];
}

@Component({
  selector: 'app-assign-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    DateTimePickerComponent,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatOption,
    MatSelect,
    MatSortModule,
    NgxSelectModule,
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './assign-vehicle-list.html',
})
export class AssignVehicleList implements OnInit, AfterViewInit, OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();
  displayedColumns: string[] = ['expand', 'userName', 'roleName', 'vehicleCount'];
  pageSizeOptions = [5, 10, 20, 50];
  dataSource = new MatTableDataSource<AssignedVehicleUser>([]);
  expandedUserId: number | null = null;
  pageSize = 10;
  searchAssignList: FormGroup;
  editForm: FormGroup;
  vehicleList: any;
  userList: User[] = [];
  editFilteredUserList: User[] = [];
  roleList: any[] = [];
  allActiveVehicles: any[] = [];

  // Edit Modal Checkbox Dropdown State
  editVehicleDropdownOpen = false;
  editSelectedVehicles: any[] = [];
  editVehicleSearchQuery = '';
  currentAssignmentFromDate: string | null = null;

  showEditModal = signal(false);
  editingAssignmentId = signal<string | null>(null);

  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');
  role = this.localStorageData.role;
  userId = this.localStorageData.userId;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private api: AssignVehicleService,
    private alert: ToastrService,
    private apiService: CommanService,
    private dateTimePickerService: DateTimePickerService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {
    this.searchAssignList = this.fb.group({
      searchTerm: this.fb.control(null),
      registrationNumber: this.fb.control(null),
      assignedDate: [new Date()],
    }, { validators: dateRangeValidator });

    this.editForm = this.fb.group({
      assignmentId: [''],
      roleId: [{ value: null as number | null, disabled: true }, Validators.required],
      userId: [{ value: null as number | null, disabled: true }, Validators.required],
      vehicleId: [null as any, Validators.required],
      isActive: [true]
    });
  }

  get totalPages(): number {
    if (!this.paginator) return 0;
    return Math.ceil(this.paginator.length / this.paginator.pageSize);
  }

  get totalRecords(): number {
    return this.dataSource.data.length;
  }

  get startRecord(): number {
    if (!this.paginator || !this.totalRecords) return 0;
    return this.paginator.pageIndex * this.paginator.pageSize + 1;
  }

  get endRecord(): number {
    if (!this.paginator) return 0;
    return Math.min(
      (this.paginator.pageIndex + 1) * this.paginator.pageSize,
      this.totalRecords
    );
  }

  ngOnInit() {
    this.getVehicleNumber();
    this.getAssignedVehicles();
    this.search();
    this.loadRoles();
    this.loadUsers();
    this.loadAllActiveVehicles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadRoles(): void {
    this.api.getRoles().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res: any) => {
        this.roleList = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (err: any) => console.error('Roles API Error:', err)
    });
  }

  loadUsers(): void {
    this.api.getUsers().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.message)) {
          this.userList = response.message;
        } else if (Array.isArray(response)) {
          this.userList = response;
        } else if (response && Array.isArray(response.data)) {
          this.userList = response.data;
        } else {
          this.userList = [];
        }
        this.editFilteredUserList = [...this.userList];
      },
      error: (err: any) => console.error('Users API Error:', err)
    });
  }

  loadAllActiveVehicles(): void {
    this.api.getActiveVehicles().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res: any) => {
        this.allActiveVehicles = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (err: any) => console.error('Active Vehicles API Error:', err)
    });
  }

  getVehicleNumber() {
    this.asignRole = UserRole[this.role as keyof typeof UserRole];
    this.apiService.list(`VehicleAssignment/getUserBasedVehicleDropDown/${this.asignRole}/${this.userId}`).pipe(takeUntil(this.unsubscribe$)).subscribe((response: any) => {
      this.vehicleList = response?.data;
    });
  }

  private router = inject(Router);
  AssignVehicle(): void {
    this.router.navigate(['/assign-vehicle']);
  }

  asignRole: any;
  getAssignedVehicles() {
    this.asignRole = UserRole[this.role as keyof typeof UserRole];

    this.apiService.list(`VehicleAssignment/getUserBasedAssignedVehicle/${this.asignRole}/${this.userId}`).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        const rows = (response?.data ?? []).map((row: AssignedVehicleUser) => ({
          ...row,
          assignments: row.assignments ?? [],
        }));
        this.dataSource.data = rows;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.alert.error('Failed to load assigned vehicles. Please try again.');
      },
    });
  }

  search() {
    const roleId = UserRole[this.role as keyof typeof UserRole];
    const searchData = {
      vehicleId: this.searchAssignList.get('registrationNumber')?.value,
      assignedDate: this.dateTimePickerService.startDate(this.searchAssignList.get('assignedDate')?.value),
      roleId: roleId,
      userId: this.userId,
    };
    this.apiService.create(`VehicleAssignment/SearchVehicleAssignments`, searchData).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        if (response.data.length > 0) {
          const rows = (response?.data ?? []).map((row: AssignedVehicleUser) => ({
            ...row,
            assignments: row.assignments ?? [],
          }));
          this.dataSource.data = rows;
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.alert.error('Failed to load assigned vehicles. Please try again.');
        this.cdr.detectChanges();
      },
    });
  }

  // =====================================================
  // VEHICLE REGISTRATION NUMBER CHECKBOX DROPDOWN LOGIC
  // =====================================================
  get selectableEditVehicles(): any[] {
    const base = this.allActiveVehicles.length > 0 ? this.allActiveVehicles : (this.vehicleList || []);
    const map = new Map<any, any>();
    for (const v of base) {
      if (v && v.vehicleId) {
        map.set(v.vehicleId, v);
      }
    }
    for (const v of this.editSelectedVehicles) {
      if (v && v.vehicleId && !map.has(v.vehicleId)) {
        map.set(v.vehicleId, v);
      }
    }
    return Array.from(map.values());
  }

  get filteredEditVehicleList(): any[] {
    const list = this.selectableEditVehicles;
    if (!this.editVehicleSearchQuery?.trim()) {
      return list;
    }
    const q = this.editVehicleSearchQuery.toLowerCase().trim();
    return list.filter(
      (v) =>
        v.registrationNumber?.toLowerCase().includes(q) ||
        v.vehicleId?.toString().toLowerCase().includes(q)
    );
  }

  toggleEditVehicleDropdown(): void {
    this.editVehicleDropdownOpen = !this.editVehicleDropdownOpen;
  }

  isEditVehicleSelected(vehicle: any): boolean {
    return this.editSelectedVehicles.some(
      (v) =>
        v.vehicleId === vehicle.vehicleId ||
        (v.registrationNumber && vehicle.registrationNumber && v.registrationNumber === vehicle.registrationNumber)
    );
  }

  onEditVehicleCheckboxChange(event: any, vehicle: any): void {
    if (event.target.checked) {
      if (!this.isEditVehicleSelected(vehicle)) {
        this.editSelectedVehicles.push(vehicle);
      }
    } else {
      this.editSelectedVehicles = this.editSelectedVehicles.filter(
        (v) =>
          v.vehicleId !== vehicle.vehicleId &&
          v.registrationNumber !== vehicle.registrationNumber
      );
    }
    this.syncEditSelectedVehiclesWithForm();
  }

  selectAllEditVehicles(event: any): void {
    if (event.target.checked) {
      this.editSelectedVehicles = [...this.selectableEditVehicles];
    } else {
      this.editSelectedVehicles = [];
    }
    this.syncEditSelectedVehiclesWithForm();
  }

  isAllEditVehiclesSelected(): boolean {
    const list = this.selectableEditVehicles;
    return list.length > 0 && this.editSelectedVehicles.length === list.length;
  }

  removeEditVehicle(vehicle: any): void {
    this.editSelectedVehicles = this.editSelectedVehicles.filter(
      (v) =>
        v.vehicleId !== vehicle.vehicleId &&
        v.registrationNumber !== vehicle.registrationNumber
    );
    this.syncEditSelectedVehiclesWithForm();
  }

  private syncEditSelectedVehiclesWithForm(): void {
    const vehicleIds = this.editSelectedVehicles.map((v) => v.vehicleId);
    this.editForm.get('vehicleId')?.setValue(vehicleIds.length > 0 ? vehicleIds : null);
    this.editForm.get('vehicleId')?.markAsDirty();
    this.editForm.get('vehicleId')?.markAsTouched();
  }

  getEditSelectedVehiclesHeaderDisplay(): string {
    if (this.editSelectedVehicles.length === 0) {
      return 'Select Vehicle Registration Number(s)';
    }
    if (this.editSelectedVehicles.length === 1) {
      return this.editSelectedVehicles[0].registrationNumber;
    }
    return `${this.editSelectedVehicles.length} Vehicles Selected`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = this.elementRef.nativeElement.querySelector('.vehicle-checkbox-dropdown');
    if (el && !el.contains(event.target)) {
      this.editVehicleDropdownOpen = false;
    }
  }

  openEdit(assignmentOrUser: any, parentRow?: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const assignmentId = assignmentOrUser?.assignmentId || assignmentOrUser?.id || assignmentOrUser;
    this.editingAssignmentId.set(assignmentId);

    this.apiService.list(`VehicleAssignment/GetVehicleAssignmentById/${assignmentId}`).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        const data = response?.data || response?.message || assignmentOrUser;
        const roleId = parentRow?.roleId || data.roleId;
        const userId = parentRow?.userId || data.userId;
        const vehicleId = data.vehicleId || assignmentOrUser?.vehicleId;
        const vehicleNumber = data.vehicleNumber || assignmentOrUser?.vehicleNumber || 'Selected Vehicle';
        this.currentAssignmentFromDate = data.fromDate || assignmentOrUser?.fromDate || new Date().toISOString();
        const isActive = data.isActive !== undefined ? data.isActive : (assignmentOrUser?.isActive ?? true);

        if (roleId !== null && roleId !== undefined && roleId !== '') {
          this.editFilteredUserList = this.userList.filter(
            (user) => Number(user.role) === Number(roleId)
          );
        } else {
          this.editFilteredUserList = [...this.userList];
        }

        const existingVeh = this.allActiveVehicles.find(v => v.vehicleId === vehicleId);
        this.editSelectedVehicles = [existingVeh || { vehicleId, registrationNumber: vehicleNumber }];
        this.editVehicleSearchQuery = '';
        this.editVehicleDropdownOpen = false;

        this.editForm.patchValue({
          assignmentId: assignmentId,
          roleId: roleId,
          userId: userId,
          vehicleId: [vehicleId],
          isActive: isActive
        });
        this.editForm.get('roleId')?.disable();

        this.showEditModal.set(true);
        this.cdr.detectChanges();
      },
      error: () => {
        const roleId = parentRow?.roleId;
        const userId = parentRow?.userId;
        const vehicleId = assignmentOrUser?.vehicleId;
        const vehicleNumber = assignmentOrUser?.vehicleNumber || 'Selected Vehicle';
        this.currentAssignmentFromDate = assignmentOrUser?.fromDate || new Date().toISOString();
        const isActive = assignmentOrUser?.isActive ?? true;

        if (roleId !== null && roleId !== undefined && roleId !== '') {
          this.editFilteredUserList = this.userList.filter(
            (user) => Number(user.role) === Number(roleId)
          );
        } else {
          this.editFilteredUserList = [...this.userList];
        }

        const existingVeh = this.allActiveVehicles.find(v => v.vehicleId === vehicleId);
        this.editSelectedVehicles = [existingVeh || { vehicleId, registrationNumber: vehicleNumber }];
        this.editVehicleSearchQuery = '';
        this.editVehicleDropdownOpen = false;

        this.editForm.patchValue({
          assignmentId: assignmentId,
          roleId: roleId,
          userId: userId,
          vehicleId: [vehicleId],
          isActive: isActive
        });
        this.editForm.get('roleId')?.disable();

        this.showEditModal.set(true);
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(assignmentIdOrUserId: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const id = assignmentIdOrUserId;
    if (id != null) {
      this.apiService.delete(`VehicleAssignment/DeleteVehicleAssignment/${id}`).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: () => {
          this.getAssignedVehicles();
          this.alert.success('Vehicle assignment deleted successfully.');
        },
        error: () => {
          this.alert.error('Unable to delete vehicle assignment.');
        }
      });
    }
  }

  onEditUserChange(event: any): void {
    const rawValue = this.extractValue(event);

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      const currentRoleId = this.editForm.getRawValue().roleId;
      if (currentRoleId !== null && currentRoleId !== undefined && currentRoleId !== '') {
        this.editFilteredUserList = this.userList.filter(
          (u) => Number(u.role) === Number(currentRoleId)
        );
      } else {
        this.editFilteredUserList = [...this.userList];
      }
      return;
    }

    const userId = Number(rawValue);
    const selectedUser = this.userList.find(
      (u) => Number(u.userId) === userId
    );

    if (selectedUser) {
      const userRoleId = Number(selectedUser.role);
      const currentRoleId = this.editForm.getRawValue().roleId;
      if (Number(currentRoleId) !== userRoleId) {
        this.editForm.get('roleId')?.setValue(userRoleId, {
          emitEvent: false
        });
      }

      this.editFilteredUserList = this.userList.filter(
        (u) => Number(u.role) === userRoleId
      );
    }
    this.cdr.detectChanges();
  }

  private extractValue(event: any): any {
    if (event === null || event === undefined) {
      return null;
    }
    if (Array.isArray(event)) {
      if (event.length === 0) return null;
      return event[0]?.value ?? event[0]?.id ?? event[0]?.userId ?? event[0];
    }
    if (typeof event === 'object') {
      return event.value ?? event.id ?? event.userId ?? null;
    }
    return event;
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingAssignmentId.set(null);
    this.editSelectedVehicles = [];
    this.editVehicleDropdownOpen = false;
    this.editVehicleSearchQuery = '';
    this.currentAssignmentFromDate = null;
    this.editForm.reset({
      assignmentId: '',
      roleId: null,
      userId: null,
      vehicleId: null,
      isActive: true
    });
  }

  updateAssignment(): void {
    if (this.editForm.invalid || this.editSelectedVehicles.length === 0) {
      Object.values(this.editForm.controls).forEach((control: AbstractControl) => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      this.alert.warning('Please fill in all required fields properly.');
      return;
    }

    const formVal = this.editForm.getRawValue();
    const primaryVehicle = this.editSelectedVehicles[0];
    const additionalVehicles = this.editSelectedVehicles.slice(1);

    const payload = {
      assignmentId: this.editingAssignmentId() || formVal.assignmentId,
      vehicleId: primaryVehicle.vehicleId,
      userId: Number(formVal.userId),
      roleId: Number(formVal.roleId),
      fromDate: this.currentAssignmentFromDate
        ? this.dateTimePickerService.toApiDateTime(this.currentAssignmentFromDate)
        : this.dateTimePickerService.toApiDateTime(new Date()),
      isActive: !!formVal.isActive,
      updatedDate: this.dateTimePickerService.toApiDateTime(new Date()),
      updatedBy: this.localStorageData.userId
    };

    this.apiService.update('VehicleAssignment/EditVehicleAssignment', payload).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        if (response?.success) {
          if (additionalVehicles.length > 0) {
            const additionalPayload = {
              fromDate: this.dateTimePickerService.toApiDateTime(new Date()),
              userId: Number(formVal.userId),
              roleId: Number(formVal.roleId),
              vehicleId: additionalVehicles.map((v: any) => v.vehicleId),
              isActive: true,
              created_date: this.dateTimePickerService.toApiDateTime(new Date()),
              createdBy: this.localStorageData.userId,
              updatedDate: this.dateTimePickerService.toApiDateTime(new Date()),
              updatedBy: this.localStorageData.userId
            };

            this.apiService.create('VehicleAssignment/saveAssignedVehicle', additionalPayload).pipe(takeUntil(this.unsubscribe$)).subscribe({
              next: () => {
                this.alert.success('Vehicle assignment updated and additional vehicles assigned successfully.');
                this.closeEditModal();
                this.getAssignedVehicles();
              },
              error: () => {
                this.alert.warning('Vehicle assignment updated, but could not assign additional vehicles.');
                this.closeEditModal();
                this.getAssignedVehicles();
              }
            });
          } else {
            this.alert.success(response.message || 'Vehicle assignment updated successfully.');
            this.closeEditModal();
            this.getAssignedVehicles();
          }
        } else {
          this.alert.error(response?.message || 'Failed to update vehicle assignment.');
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.alert.error(error?.error?.message || 'Failed to update vehicle assignment.');
        this.cdr.detectChanges();
      }
    });
  }

  isEditFieldInvalid(fieldName: string): boolean {
    const control = this.editForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getEditFieldError(fieldName: string): string {
    const control = this.editForm.get(fieldName);
    if (!control?.errors) return '';
    const errors = control.errors as ValidationErrors;
    if (errors['required']) return `${this.getEditFieldLabel(fieldName)} is required.`;
    return `${this.getEditFieldLabel(fieldName)} is invalid.`;
  }

  private getEditFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      roleId: 'Role',
      userId: 'User',
      vehicleId: 'Vehicle Registration Number'
    };
    return labels[fieldName] ?? fieldName;
  }

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

  toggleRow(row: AssignedVehicleUser, event?: Event) {
    event?.stopPropagation();
    this.expandedUserId = this.isExpanded(row) ? null : row.userId;
  }

  isExpanded(row: AssignedVehicleUser): boolean {
    return this.expandedUserId === row.userId;
  }

  isInvalid(controlName: string): boolean {
    const control = this.searchAssignList.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  hasDateRangeError(): boolean {
    return (
      this.searchAssignList.hasError('dateRangeInvalid') &&
      !!(
        this.searchAssignList.get('fromDate')?.touched ||
        this.searchAssignList.get('toDate')?.touched
      )
    );
  }
}

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
