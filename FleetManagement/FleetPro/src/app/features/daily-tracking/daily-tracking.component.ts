import {
  AfterViewInit,
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
  FormsModule
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
    MatSelect
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


  // Tenant ID
  private tenandId =
    localStorage.getItem('fleetPro_TenantId');


  // Logged-in user information
  localStorageData = JSON.parse(
    localStorage.getItem('fleetpro_user') || '{}'
  );


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

    this.load();

  }


  ngAfterViewInit(): void {

    this.dataSource.paginator =
      this.paginator;

    this.dataSource.sort =
      this.sort;

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


  // =========================================================
  // Load Daily Tracking
  // =========================================================

  load(): void {

    this.loading.set(true);


    const roleId =
      UserRole[
        this.role as keyof typeof UserRole
      ];


    const payload =
      (
        this.filterFrom ||
        this.filterTo
      )
        ? {

            fromDate:
              this.filterFrom || null,

            toDate:
              this.filterTo || null

          }

        : null;


    console.log(
      'Calling Daily Tracking API...'
    );


    console.log(
      'Tenant ID:',
      this.tenandId
    );


    console.log(
      'Role ID:',
      roleId
    );


    console.log(
      'User ID:',
      this.userId
    );


    console.log(
      'Request Payload:',
      payload
    );


    this.api
      .create(

        `DailyTracking/${this.tenandId}/getDailyTrakingBySearch/${roleId}/${this.userId}`,

        payload

      )

      .pipe(
        takeUntil(
          this.unsubscribe$
        )
      )

      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (data: any) => {


          console.log(
            '===================================='
          );


          console.log(
            'getDailyTracking API RESPONSE:'
          );


          console.log(
            data
          );


          console.log(
            '===================================='
          );


          let items: any[] = [];


          // API returns array directly
          if (Array.isArray(data)) {

            items = data;

          }


          // API returns { message: [] }
          else if (
            data &&
            Array.isArray(data.message)
          ) {

            items =
              data.message;

          }


          // API returns { data: [] }
          else if (
            data &&
            Array.isArray(data.data)
          ) {

            items =
              data.data;

          }


          console.log(
            'Processed Records:',
            items
          );


          console.log(
            'Total Records:',
            items.length
          );


          // Set signal
          this.records.set(items);


          // Set Material table
          this.dataSource.data =
            items;


          // Make sure paginator is connected
          if (this.paginator) {

            this.dataSource.paginator =
              this.paginator;

          }


          // Make sure sorting is connected
          if (this.sort) {

            this.dataSource.sort =
              this.sort;

          }


          this.loading.set(false);

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            '===================================='
          );


          console.error(
            'Error loading daily tracking:'
          );


          console.error(
            error
          );


          console.error(
            '===================================='
          );


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