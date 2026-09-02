import { ChangeDetectorRef, Component, Inject, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
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

import { ApiService } from '../../app/core/services/api.service';
import vehicleOptions from '../../ennum/vehicle-option.json';
import { CommanService } from '../core/services/comman.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const DATE_PICKER_FORMATS = {
  parseInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
  fullPickerInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
  datePickerInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
  timePickerInput: { hour: 'numeric', minute: 'numeric' },
  monthYearLabel: { year: 'numeric', month: 'long' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' }
};
const DATE_ONLY_FORMAT = /^\d{2}-\d{2}-\d{4}$/;

@Injectable()
class HyphenDateTimeAdapter extends NativeDateTimeAdapter {
  constructor(
    @Inject(OWL_DATE_TIME_LOCALE) locale: string,
    platform: Platform
  ) {
    super(locale, platform);
  }

  override format(date: Date, displayFormat: any): string {
    if (
      displayFormat?.day === '2-digit' &&
      displayFormat?.month === '2-digit' &&
      !displayFormat?.hour
    ) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${date.getFullYear()}`;
    }

    return super.format(date, displayFormat);
  }

  override parse(value: any, parseFormat: any): Date | null {
    if (typeof value === 'string' && DATE_ONLY_FORMAT.test(value.trim())) {
      const [day, month, year] = value.trim().split('-').map(Number);
      return this.createDate(year, month - 1, day);
    }

    return super.parse(value, parseFormat);
  }
}

@Component({
  selector: 'app-new-vehicle-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  providers: [
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-GB' },
    { provide: OWL_DATE_TIME_FORMATS, useValue: DATE_PICKER_FORMATS },
    HyphenDateTimeAdapter,
    { provide: DateTimeAdapter, useExisting: HyphenDateTimeAdapter }
  ],
  templateUrl: './new-vehicle-master.html',
  styleUrl: './new-vehicle-master.css'
})
export class NewVehicleMaster implements OnInit {
  protected readonly unsubscribe$ = new Subject<void>();
  vehicleCategories = vehicleOptions.vehicleCategories;
  vehicleTypes = vehicleOptions.vehicleTypes;
  fuelTypes = vehicleOptions.fuelTypes;
  vehicleStatuses = vehicleOptions.vehicleStatuses;
  
  isSaveButton : boolean = true;
  updateButton : boolean = false;
  vehicleId : any;
  
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');

  vehicleForm = this.fb.group({
    date: [null as Date | null],
    registrationNumber: ['',[Validators.required,Validators.maxLength(20),Validators.pattern(/^[A-Za-z0-9\s-]+$/)]],
    vehicleTypeId: ['',Validators.required],
    vehicleCategory: ['',Validators.required],
    make: ['',[Validators.required,Validators.maxLength(50)]],
    model: ['',[Validators.required,Validators.maxLength(50)]],
    chassisNumber: ['',[Validators.required,Validators.maxLength(50),Validators.pattern(/^[A-Za-z0-9-]+$/)]],
    fuelTypeId: ['',Validators.required],
    insurancePolicyNo: ['',Validators.maxLength(100)],
    insuranceExpiryDate: [null as Date | null],
    rcNumber: ['',[Validators.required,Validators.maxLength(50)]],
    fcNumber: ['',[Validators.required,Validators.maxLength(50)]],
    fcDate: [null as Date | null,[Validators.required]],
    vehicleStatusId: ['',Validators.required],
    lastServiceDate: [null as Date | null],
    isAvailable: [true]
  });

  constructor(
         private apiService : CommanService, private cdr: ChangeDetectorRef,
         private router : Router, private alert: ToastrService,private route: ActivatedRoute
      ) {}

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.isSaveButton = false;
      this.updateButton = true;
      this.getVehicleById(this.vehicleId);
    }
  }

  save(): void {

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const vehicleData = {
      registrationNumber : this.vehicleForm.get("registrationNumber")?.value,
      vehicleTypeId: Number(this.vehicleForm.get("vehicleTypeId")?.value) || 0,
      vehicleCategory: Number(this.vehicleForm.get("vehicleCategory")?.value) || 0,
      make: this.vehicleForm.get("make")?.value,
      model: this.vehicleForm.get("model")?.value,
      chassisNumber: this.vehicleForm.get("chassisNumber")?.value,
      fuelTypeId: Number(this.vehicleForm.get("fuelTypeId")?.value) || 0,
      insurancePolicyNo : this.vehicleForm.get("insurancePolicyNo")?.value,
      insuranceExpiryDate : this.toApiDate(this.vehicleForm.get("insuranceExpiryDate")?.value),
      rcNumber : this.vehicleForm.get("rcNumber")?.value,
      fcNumber : this.vehicleForm.get("fcNumber")?.value,
      fcDate : this.toApiDate(this.vehicleForm.get("fcDate")?.value),
      vehicleStatusId: Number(this.vehicleForm.get("vehicleStatusId")?.value) || 0,
      lastServiceDate : this.toApiDate(this.vehicleForm.get("lastServiceDate")?.value),
      isAvailable : this.vehicleForm.get("isAvailable")?.value,
      created_date : new Date().toISOString(),
      createdBy : this.localStorageData.userId,
      updatedDate : new Date().toISOString(),
      updatedBy : this.localStorageData.userId,
    }

   this.apiService.create(`VehicleMst/SaveVehicleDetails`, vehicleData).pipe(takeUntil(this.unsubscribe$)).subscribe((data) =>{
      if(data){
        this.alert.success("Vehicle Master Saved Successfully")
        this.reset(); 
      }
   },(error) =>{
     this.alert.error("Unable to Save Vehicle Master");
   });

  }

  getVehicleById(id: any): void {
    this.apiService.list(`VehicleMst/getVehicleById/${id}`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      if(data){
        this.vehicleForm.patchValue(data);
      }
    });
  }

  updateVehicle(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const vehicleData = {
      registrationNumber : this.vehicleForm.get("registrationNumber")?.value,
      vehicleTypeId: Number(this.vehicleForm.get("vehicleTypeId")?.value) || 0,
      vehicleCategory: Number(this.vehicleForm.get("vehicleCategory")?.value) || 0,
      make: this.vehicleForm.get("make")?.value,
      model: this.vehicleForm.get("model")?.value,
      chassisNumber: this.vehicleForm.get("chassisNumber")?.value,
      fuelTypeId: Number(this.vehicleForm.get("fuelTypeId")?.value) || 0,
      insurancePolicyNo : this.vehicleForm.get("insurancePolicyNo")?.value,
      insuranceExpiryDate : this.toApiDate(this.vehicleForm.get("insuranceExpiryDate")?.value),
      rcNumber : this.vehicleForm.get("rcNumber")?.value,
      fcNumber : this.vehicleForm.get("fcNumber")?.value,
      fcDate : this.toApiDate(this.vehicleForm.get("fcDate")?.value),
      vehicleStatusId: Number(this.vehicleForm.get("vehicleStatusId")?.value) || 0,
      lastServiceDate : this.toApiDate(this.vehicleForm.get("lastServiceDate")?.value),
      updatedDate : new Date().toISOString(),
      updatedBy : this.localStorageData.userId,
    }

    this.apiService.update(`VehicleMst/UpdateVehicleDetails/${this.vehicleId}`, vehicleData).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      if(data.success == true){
        this.alert.success("Vehicle Master Updated Successfully")
        this.reset();
         this.router.navigate(['/vehicles']);
      }
    },(error) =>{
     this.alert.error("Unable to Update Vehicle Master");
   });
  }

  reset(){
     this.vehicleForm.reset({
          date: null,
          registrationNumber: null,
          vehicleTypeId: '',
          vehicleCategory: '',
          make: null,
          model: null,
          chassisNumber: null,
          fuelTypeId: '',
          insurancePolicyNo: '',
          insuranceExpiryDate: null,
          rcNumber: null,
          fcNumber: null,
          fcDate: null,
          vehicleStatusId: '',
          lastServiceDate: null,
          isAvailable: true
        });
  }

  private toApiDate(value: Date | string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}
