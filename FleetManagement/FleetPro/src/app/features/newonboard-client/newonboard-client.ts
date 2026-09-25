import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommanService } from '../../core/services/comman.service';
import { DateTimePickerService } from '../../core/services/datetime-picker.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newonboard-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './newonboard-client.html',
  styleUrl: './newonboard-client.css'
})
export class NewonboardClientComponent implements OnChanges {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  protected readonly unsubscribe$ = new Subject<void>();

  /** When provided, the form will be pre-filled with this client's data */
  @Input() clientData: any = null;
  /** When true, the form fields are disabled (read-only profile view) */
  @Input() viewMode: boolean = false;

  clientForm: FormGroup;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');

  constructor(private apiService: CommanService, private dateTimePickerService : DateTimePickerService, private alert : ToastrService,
      private router : Router, public location: Location
  ) {
    this.clientForm = this.fb.group({
      customerName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required,Validators.pattern( /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ )],
      emailId: ['', [Validators.required,Validators.pattern( /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/ )]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      address: ['', Validators.required],
      gstNo: ['', Validators.required],
      panNo: ['', Validators.required],
      isAvailable: [true],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientData'] && this.clientData) {
      this.clientForm.controls["customerName"].setValue(this.clientData.customerName);
      this.clientForm.controls["userName"].setValue(this.clientData.userName);
      this.clientForm.controls["emailId"].setValue(this.clientData.emailId);
      this.clientForm.controls["phoneNo"].setValue(this.clientData.phoneNo);
      this.clientForm.controls["address"].setValue(this.clientData.address);
      this.clientForm.controls["gstNo"].setValue(this.clientData.gstNo);
      this.clientForm.controls["panNo"].setValue(this.clientData.panNo);
      this.clientForm.controls["isAvailable"].setValue(this.clientData.isActive);
    }
  }


  
submitForm(): void {

  this.successMessage = '';
  this.errorMessage = '';

  if (this.clientForm.invalid) {
    this.clientForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;

  const formValue = this.clientForm.value;

  const payload = {
    customerName: formValue.customerName,
    userName: formValue.userName,
    password: formValue.password,
    emailId: formValue.emailId,
    phoneNo: formValue.phoneNo,
    address: formValue.address,
    gstNo: formValue.gstNo,
    panNo: formValue.panNo,
    isSuperAdmin: 'no',
    createdDate: this.dateTimePickerService.toApiDateTime(new Date()),
    createdBy: this.localStorageData.userId,
    updatedDate: this.dateTimePickerService.toApiDateTime(new Date()),
    updatedBy: this.localStorageData.userId
  };

  this.apiService.create(`Tenant/AddOnboardClient`, payload).pipe(takeUntil(this.unsubscribe$)).subscribe({
         next: (response: any) => {
          if(response.success == true){
          this.alert.success('Client and Admin account created successfully.');
          this.router.navigate(['/superAdminList/onboardedClients']);
          }
          else{
            this.alert.error('Facing error while creating the customer');
          }
        },
        error: (error: any) => {
          this.alert.error('Facing error while creating the customer');
        }
  })

}

  updateAdmin(){
    const payload = {
      tenantId : this.clientData.tenantId,
      customerName: this.clientForm.get("customerName")?.value,
      emailId: this.clientForm.get("emailId")?.value,
      phoneNo: this.clientForm.get("phoneNo")?.value,
      address: this.clientForm.get("address")?.value,
      gstNo: this.clientForm.get("gstNo")?.value,
      panNo: this.clientForm.get("panNo")?.value,
      isActive: this.clientForm.get("isAvailable")?.value,
      updatedDate: this.dateTimePickerService.toApiDateTime(new Date()),
      updatedBy: this.localStorageData.userId
    };

     this.apiService.update(`Tenant/UpdateAdminData`, payload).pipe(takeUntil(this.unsubscribe$)).subscribe({
         next: (response: any) => {
          if(response == true){
          this.alert.success('Client and Admin account Updated successfully.');
          this.location.back();
          }
          else{
            this.alert.error('Facing error while updating the customer');
          }
        },
        error: (error: any) => {
          this.alert.error('Facing error while updating the customer');
        }
  });
  }

  isInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
}

