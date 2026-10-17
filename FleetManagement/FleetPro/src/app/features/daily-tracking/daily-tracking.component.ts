import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import {
  CommonModule,
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import { Router } from '@angular/router';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import {
  MatFormField,
  MatOption,
  MatSelect
} from '@angular/material/select';

import {
  Subject,
  takeUntil
} from 'rxjs';

import { CommanService } from '../../core/services/comman.service';

import {
  UserRole,
  Vehicle
} from '../../core/models';
import { NgxSelectModule } from 'ngx-select-ex';
import { DateTimePickerService } from '../../core/services/datetime-picker.service';
import { DateTimePickerComponent } from '../../shared/datetime-picker/datetime-picker';


@Component({
  selector: 'app-daily-tracking',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,

    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,

    MatFormField,
    MatOption,
    MatSelect,
    NgxSelectModule,
    DateTimePickerComponent
  ],

  templateUrl: './daily-tracking.component.html',

  styleUrl: './daily-tracking.component.css'
})


export class DailyTrackingComponent
  implements OnInit, AfterViewInit, OnDestroy {


  protected readonly unsubscribe$ =
    new Subject<void>();


  private api = inject(CommanService);

  private fb = inject(FormBuilder);

  private router = inject(Router);
  private dateTimePickerService = inject(DateTimePickerService);
  private cdr = inject(ChangeDetectorRef);


  // Tenant ID
  private tenandId =
    localStorage.getItem('fleetPro_TenantId');


  // Logged-in user information
  localStorageData = JSON.parse(
    localStorage.getItem('fleetpro_user') || '{}'
  );

  vehicleList: any;
  role = this.localStorageData.role;

  userId = this.localStorageData.userId;


  // =========================================================
  // API Records
  // =========================================================

  records = signal<any[]>([]);

  vehicles = signal<Vehicle[]>([]);


  showForm = signal(false);

  loading = signal(false);


  // =========================================================
  // Filters
  // =========================================================

  filterVehicleId = '';

  filterFrom = '';

  filterTo = '';


  // =========================================================
  // Material Table
  // =========================================================

  dataSource =
    new MatTableDataSource<any>([]);


  @ViewChild(MatSort)
  sort!: MatSort;


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;


  // =========================================================
  // Table Columns
  // =========================================================

  displayedColumns: string[] = [

    // Serial Number
    'serialNo',

    // Vehicle
    'registrationNumber',

    // Date
    'tripDate',

    // Locations
    'fromLocation',
    'toLocation',

    // Diesel
    'dieselLitres',
    'dieselCost',

    // KM
    'fromKm',
    'toKm',

    // Actions
    'actions'
  ];


  // =========================================================
  // Pagination
  // =========================================================

  pageSize = 10;


  get totalPages(): number {

    if (!this.paginator) {
      return 0;
    }

    return Math.ceil(
      this.paginator.length /
      this.paginator.pageSize
    );
  }


  get totalRecords(): number {

    return this.dataSource.data.length;

  }


  get startRecord(): number {

    if (!this.paginator ||
        this.totalRecords === 0) {

      return 0;

    }

    return (
      this.paginator.pageIndex *
      this.paginator.pageSize
    ) + 1;

  }


  get endRecord(): number {

    if (!this.paginator ||
        this.totalRecords === 0) {

      return 0;

    }

    return Math.min(

      (
        this.paginator.pageIndex + 1
      ) *
      this.paginator.pageSize,

      this.totalRecords

    );

  }


  // =========================================================
  // Form
  // =========================================================
  searchTracking = this.fb.group({

    registrationNumber: this.fb.control(null),
    fromDate: [new Date()],
    toDate: [new Date()]
  }, { validators: dateRangeValidator });


  /** Returns the currently selected From Date value (or null) for use in [minDate] / [disabled] bindings on the To Date picker. */
  get selectedFromDate(): Date | null {
    const val: any = this.searchTracking.get('fromDate')?.value;
    if (!val) return null;
    return val instanceof Date ? val : new Date(val);
  }

  form = this.fb.group({

    vehicleId: [
      '',
      Validators.required
    ],

    date: [
      new Date()
        .toISOString()
        .substring(0, 10),

      Validators.required
    ],

    fuelStation: [''],

    dieselLitres: [0],

    dieselCost: [0],

    fromKm: [
      0,
      Validators.required
    ],

    toKm: [
      0,
      Validators.required
    ],

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


  // =========================================================
  // Angular Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.getVehicleNumber();
    this.load();

  }


  ngAfterViewInit(): void {

    this.dataSource.paginator =
      this.paginator;

    this.dataSource.sort =
      this.sort;

    // Trigger a second change-detection pass so that getters that depend
    // on `paginator` (startRecord, endRecord, totalPages) are evaluated
    // after the view is fully initialised, preventing NG0100.
    this.cdr.detectChanges();

  }


  ngOnDestroy(): void {

    this.unsubscribe$.next();

    this.unsubscribe$.complete();

  }


  // =========================================================
  // Pagination Methods
  // =========================================================

  changePageSize(size: number): void {

    this.pageSize = size;

    this.paginator.pageSize = size;

    this.paginator.firstPage();

    this.dataSource.paginator =
      this.paginator;

  }


  firstPage(): void {

    this.paginator.firstPage();

  }


  previousPage(): void {

    this.paginator.previousPage();

  }


  nextPage(): void {

    this.paginator.nextPage();

  }


  lastPage(): void {

    this.paginator.pageIndex =
      this.totalPages - 1;

    this.paginator._changePageSize(
      this.paginator.pageSize
    );

  }

  asignRole : any;
  getVehicleNumber() {
    this.asignRole = UserRole[this.role as keyof typeof UserRole];
    this.api.list(`VehicleAssignment/${this.tenandId}/getUserBasedVehicleDropDown/${this.asignRole}/${this.userId}`).pipe(takeUntil(this.unsubscribe$)).subscribe((response: any) => {
      this.vehicleList = response?.data;
    });
  }

  load(): void {
    this.loading.set(true);

    const roleId =UserRole[this.role as keyof typeof UserRole];


    const payload = {
      registrationNumber: this.searchTracking.get('registrationNumber')?.value || null,
      fromDate: this.searchTracking.get('fromDate')?.value
        ? this.dateTimePickerService.startDate(this.searchTracking.get('fromDate')!.value)
        : null,
      toDate: this.searchTracking.get('toDate')?.value
        ? this.dateTimePickerService.endDate(this.searchTracking.get('toDate')!.value)
        : null
    }
    this.api.create(`DailyTracking/${this.tenandId}/getDailyTrakingBySearch/${roleId}/${this.userId}`,payload).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (data: any) => {
          let items: any[] = [];
          if (Array.isArray(data)) {
            items = data;
          }
          // API returns { message: [] }
          else if (data &&Array.isArray(data.message)) {
            items = data.message;
          }

          // API returns { data: [] }
          else if (data && Array.isArray(data.data)) {
            items = data.data;
          }

          // Set signal
          this.records.set(items);

          // Set Material table
          this.dataSource.data = items;


          // Make sure paginator is connected
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }


          // Make sure sorting is connected
          if (this.sort) {
            this.dataSource.sort =this.sort;
          }
          this.loading.set(false);

        },

        error: (error) => {
          this.records.set([]);
          this.dataSource.data = [];
          this.loading.set(false);
        }

      });

  }


  // =========================================================
  // Open Create Page
  // =========================================================

  OpenCreate(): void {

    this.router.navigate([
      '/daily-log-report'
    ]);

  }


  // =========================================================
  // Open Create Form
  // =========================================================

  openCreate(): void {


    this.form.reset({

      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      dieselLitres: 0,

      dieselCost: 0,

      fromKm: 0,

      toKm: 0,

      kmBeforeFueling: 0,

      tollCharges: 0,

      insuranceShare: 0,

      workshopExpenses: 0,

      tyreMaintenance: 0,

      driverSalary: 0,

      rtoCharges: 0,

      tripRevenue: 0

    });


    this.showForm.set(true);

  }


  // =========================================================
  // Close Form
  // =========================================================

  closeForm(): void {

    this.showForm.set(false);

  }


  // =========================================================
  // Edit
  // =========================================================

  editRecord(record: any): void {

    console.log(
      'Edit tracking record:',
      record
    );

  }


  // =========================================================
  // Delete
  // =========================================================

  deleteRecord(record: any): void {

    console.log(
      'Delete tracking record:',
      record
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