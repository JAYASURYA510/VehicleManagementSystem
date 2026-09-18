import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class NewonboardClientComponent {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  protected readonly unsubscribe$ = new Subject<void>();

  clientForm: FormGroup;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');

  constructor(private apiService: CommanService, private dateTimePickerService : DateTimePickerService, private alert : ToastrService,
      private router : Router
  ) {
    this.clientForm = this.fb.group({
      customerId: ['', Validators.required, Validators.pattern(/^[0-9]{6}$/)],
      customerName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required,Validators.pattern( /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ )],
      emailId: ['', [Validators.required,Validators.pattern( /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/ )]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      address: ['', Validators.required],
      gstNo: ['', Validators.required],
      tanNo: ['', Validators.required]
    });
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
    customerId: formValue.customerId,
    customerName: formValue.customerName,
    userName: formValue.userName,
    password: formValue.password,
    emailId: formValue.emailId,
    phoneNo: formValue.phoneNo,
    address: formValue.address,
    gstNo: formValue.gstNo,
    tanNo: formValue.tanNo,
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



  isInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
}

