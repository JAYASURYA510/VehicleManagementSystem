import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  clientForm: FormGroup;

  // Replace this with your actual API URL
  private apiUrl = 'https://localhost:7236/api/Tenant/AddOnboardClient';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
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

    // Always send "no"
    isSuperAdmin: 'no',

    createdDate: new Date().toISOString(),
    createdBy: 0,
    updatedDate: new Date().toISOString(),
    updatedBy: 0
  };

  // Log payload before sending
  console.log('Payload sent to backend:', payload);

  this.http.post(this.apiUrl, payload).subscribe({

    next: (response) => {

      // Log complete backend response
      console.log('Backend response:', response);

      // Optional: log response as JSON
      console.log(
        'Backend response JSON:',
        JSON.stringify(response, null, 2)
      );

      this.successMessage = 'Client onboarded successfully!';
      this.isSubmitting = false;

      this.clientForm.reset();
    },

    error: (error) => {

      // Log backend error response
      console.error('Backend error:', error);

      // Log error body returned by API
      console.error('Backend error response:', error?.error);

      this.errorMessage =
        error?.error?.message ||
        'Unable to onboard client. Please try again.';

      this.isSubmitting = false;
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

