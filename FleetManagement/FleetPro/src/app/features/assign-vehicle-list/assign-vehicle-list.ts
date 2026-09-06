import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DateTimePickerComponent } from '../../shared/datetime-picker/datetime-picker';
import { CommanService } from '../../core/services/comman.service';
import { NgxSelectModule } from 'ngx-select-ex';
import { User } from '../assign-vehicle-mst/assign-vehicle-mst';
import { Router } from '@angular/router';

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
  vehicleList: any;
  filteredUserList: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder,private api: AssignVehicleService, private alert: ToastrService,private apiService : CommanService) {
      this.searchAssignList = this.fb.group({
        searchTerm : this.fb.control(null),
        registrationNumber : this.fb.control(null),
        fromDate: [null as Date | null],
        toDate: [null as Date | null]
      }, { validators: dateRangeValidator });
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
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
   getVehicleNumber(){
    this.apiService.list(`VehicleMst/getAllVehicleForDropDown`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      this.vehicleList = data?.message;
    });
   }

   private router = inject(Router);
   AssignVehicle(): void {
  this.router.navigate(['/assign-vehicle']);
   }
   
  getAssignedVehicles() {
    this.api.getUserBasedAssignedVehicle().pipe(takeUntil(this.unsubscribe$)).subscribe({
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
