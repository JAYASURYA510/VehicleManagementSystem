import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ApiService } from '../../app/core/services/api.service';
import vehicleOptions from '../../ennum/vehicle-option.json';
import { CommanService } from '../core/services/comman.service';
import { DateTimePickerService } from '../core/services/datetime-picker.service';
import { DateTimePickerComponent } from '../shared/datetime-picker/datetime-picker';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-vehicle-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DateTimePickerComponent
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
         private router : Router, private alert: ToastrService,private route: ActivatedRoute,
         private dateTimePickerService: DateTimePickerService
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
      insuranceExpiryDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("insuranceExpiryDate")?.value),
      rcNumber : this.vehicleForm.get("rcNumber")?.value,
      fcNumber : this.vehicleForm.get("fcNumber")?.value,
      fcDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("fcDate")?.value),
      vehicleStatusId: Number(this.vehicleForm.get("vehicleStatusId")?.value) || 0,
      lastServiceDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("lastServiceDate")?.value),
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
      insuranceExpiryDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("insuranceExpiryDate")?.value),
      rcNumber : this.vehicleForm.get("rcNumber")?.value,
      fcNumber : this.vehicleForm.get("fcNumber")?.value,
      fcDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("fcDate")?.value),
      vehicleStatusId: Number(this.vehicleForm.get("vehicleStatusId")?.value) || 0,
      lastServiceDate : this.dateTimePickerService.toApiDate(this.vehicleForm.get("lastServiceDate")?.value),
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

}
