import { AfterViewInit, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Vehicle } from '../../core/models';
import { CommanService } from '../../core/services/comman.service';
import { Subject, takeUntil } from 'rxjs';
import { NgxSelectModule } from 'ngx-select-ex';
import vehicleoption from '../../../ennum/vehicle-option.json';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatFormField, MatOption, MatSelect } from "@angular/material/select";
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatTableModule, MatSortModule, NgxSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule, MatFormField, MatOption, MatSelect],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit, AfterViewInit {
  protected readonly unsubscribe$ = new Subject<void>();
  private api = inject(ApiService);
  auth = inject(AuthService);
  private fb2 = inject(FormBuilder);
  serachVehicle: FormGroup;
  vehicles = signal<Vehicle[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  vehicleList : any;
  vehicleOption : typeof vehicleoption.vehicleTypes = vehicleoption.vehicleTypes;
  vehicleStatuses : typeof vehicleoption.vehicleStatuses = vehicleoption.vehicleStatuses;

  dataSource = new MatTableDataSource<Vehicle>();

  @ViewChild(MatSort) sort!: MatSort;

  get displayedColumns(): string[] {
    return this.canManage
      ? ['registrationNumber', 'vehicleType', 'chassisNumber', 'rcNumber', 'fcNumber', 'isActive', 'actions']
      : ['registrationNumber', 'vehicleType', 'chassisNumber', 'rcNumber', 'fcNumber', 'isActive'];
  }

  filterVehicleId = '';
  filterFrom = '';
  filterTo = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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


  constructor(private fb: FormBuilder,private apiService : CommanService,private alert: ToastrService,private router : Router) {
     this.serachVehicle = this.fb.group({
      registrationNumber : this.fb.control(null),
      vehicleType : this.fb.control(null),
      VehicleStatus : this.fb.control(null),
      searchTerm : this.fb.control(null),
     });
  }
  ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}

  form = this.fb2.group({
    registrationNumber: ['', Validators.required],
    vehicleType: ['Truck', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    driverName: ['', Validators.required]
  });

  ngOnInit(): void { 
    this.load(); 
    this.getVehicleNumber();
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



  getVehicleNumber(){
    this.apiService.list(`VehicleMst/getAllVehicleForDropDown`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      this.vehicleList = data?.message;
    });
  }
  load(): void {
    this.api.get<any[]>('VehicleMst/getAllVehicle').subscribe({
      next: (data) => {
        if(data.length > 0){
         this.dataSource.data = data;
        }
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
      }
    });
  }

  getVehicleType(id : any){
    return this.vehicleOption.find(x => x.id === Number(id))?.name ?? '';
  }

  filteredVehicles(): Vehicle[] {
    return this.dataSource.data || this.vehicles();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ vehicleType: 'Truck', year: new Date().getFullYear() });
    this.showForm.set(true);
  }

  openEdit(v: Vehicle): void {
    this.editingId.set(v.id);
    this.form.patchValue(v);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (this.form.invalid) return;
    const body = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.api.put(`vehicles/${id}`, { ...body, id, isActive: true }).subscribe(() => { this.closeForm(); this.load(); });
    } else {
      this.api.post('vehicles', body).subscribe(() => { this.closeForm(); this.load(); });
    }
  }

  onSearch(){
    const payload = {
      registrationNumber : this.serachVehicle.get('registrationNumber')?.value ? this.serachVehicle.get('registrationNumber')?.value : null,
      vehicleTypeId :this.serachVehicle.get('vehicleType')?.value ? this.serachVehicle.get('vehicleType')?.value : null,
      vehicleStatusId :this.serachVehicle.get('VehicleStatus')?.value ? this.serachVehicle.get('VehicleStatus')?.value : null,
      searchTerm :this.serachVehicle.get('searchTerm')?.value ? this.serachVehicle.get('searchTerm')?.value : null
    }

    this.apiService.create(`VehicleMst/getVehicleBySearch`, payload).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      if(data.message.length > 0){
         this.dataSource.data = data.message;
      }
    });
  }

  editVehicle(id: any): void {
    this.router.navigate(['/NewVehiclemaster/edit', id]);
  }

  deleteVehicle(id: number): void {
    if(id){
      this.apiService.delete(`VehicleMst/DeleteVehicleDetails/${id}`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
        if(data.success == true){
           this.load();
           this.getVehicleNumber()
            this.alert.success("Vehicle Deleted Successfully");
        }
        else{
          this.alert.error("Failed");
        }
      },(error) => {
            this.alert.error("Failed");
    });
    }
    this.api.delete(`vehicles/${id}`).subscribe(() => this.load());
  }

  get canManage() { return this.auth.isAdminOrSuperAdmin(); }
}
