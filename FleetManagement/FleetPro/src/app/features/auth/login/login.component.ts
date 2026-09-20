
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { CommanService } from '../../../core/services/comman.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  protected readonly unsubscribe$ = new Subject<void>();
  localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');

  // Username + Password form
  form: any;


  // Customer ID form
  customerForm: any;


  roleList: any;


  // Error message
  error = signal('');


  // Loading state
  loading = signal(false);


  // Customer validation status
  customerValidated = signal(false);


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private apiService: CommanService,
    private router: Router
  ) {

    // Login form
    this.form = this.fb.group({

      username: [
        '',
        Validators.required
      ],

      password: [
        '',
        Validators.required
      ]

    });


    // Customer ID form
    this.customerForm = this.fb.group({

      customerId: [
        '',
        Validators.required
      ]

    });

  }


  ngOnInit(): void {
    this.loadRole();
  }


  /*
   * Load Roles
   */
  loadRole(): void {

    this.auth
      .getRoleForLog()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe({

        next: (data: any) => {
          this.roleList = data;
        },

        error: (err: any) => {

          console.error(
            'Role loading failed:',
            err
          );

        }

      });

  }


  /*
   * Validate Customer ID
   */
  errorMessage : boolean = false;
  customerData : any;
  validateCustomer(): void {
    this.errorMessage = false;
    this.error.set('');
    // Validate customer form
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    // Start loading
    this.loading.set(true);

    const customerId =this.customerForm.get('customerId')?.value;

    this.apiService.list(`Customer/validtenant/${customerId}`).subscribe({
        next: (response: any) => {
          if(response.success == true){
          this.customerData = response.message;
          this.loading.set(false);
          localStorage.setItem('fleetPro_TenantId', this.customerData?.tenantId);
          localStorage.setItem('fleetPro_CustomerId', this.customerData?.customerId);
          localStorage.setItem('fleetPro_CustomerName', this.customerData?.customerName);
          localStorage.setItem('fleetPro_Email', this.customerData?.emailId);
          localStorage.setItem('fleetPro_PhoneNum', this.customerData?.phoneNo);
          this.customerValidated.set(true);
          this.error.set('');
          }
          else{
            this.errorMessage = true;
          }
        },
        error: (err: any) => {

          this.loading.set(false);
          if (err.status === 0) {
            this.error.set(
              'Cannot connect to server. Please try again later.'
            );
          }
          else if (err.status === 401) {
            this.error.set(
              'Invalid Customer ID.'
            );
          }
          else if (err.status === 404) {
            this.error.set(
              'Customer ID not found.'
            );
          }
          else if (err.status === 400) {
            this.error.set(
              err.error?.message ||
              'Invalid Customer ID.'
            );
          }
          else {
            this.error.set(
              err.error?.message ||
              'Customer validation failed.'
            );
          }
        }
      });
  }


  backToCustomer(): void {
    this.customerValidated.set(false);
    this.form.reset();
    this.error.set('');
    this.loading.set(false);
  }

  /*
   * Login
   */
  tenantId : any;
  onSubmit(): void {
    this.error.set('');
    // Validate form
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.tenantId = localStorage.getItem('fleetPro_TenantId');

    // Start loading
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
        next: (data) => {
        this.loading.set(false);
         this.customerData = data;
          this.loading.set(false);
          localStorage.setItem('fleetPro_TenantId', this.customerData?.tenantId);   
          localStorage.setItem('fleetPro_CustomerName', this.customerData?.customerName);
          localStorage.setItem('fleetPro_PhoneNum', this.customerData?.phoneNum);
        if(data.role == "SuperAdmin"){
          this.router.navigate(['/superAdminList']);
        }
        else{
          this.router.navigate(['/dashboard']);
        }
        },
        error: (err: any) => {
          this.loading.set(false);
        console.error('Login error:', err);
        /*
         * Backend not available
         */
          if (err.status === 0) {
            this.error.set(
              'Cannot connect to server. Please try again later.'
            );
          }
        /*
         * Wrong username/password
         */
          else if (err.status === 401) {
            this.error.set(
              'Invalid username or password.'
            );
          }
        /*
         * Bad request
         */
          else if (err.status === 400) {
            this.error.set(
            err.error?.message || 'Invalid login details.'
            );
          }
        /*
         * Other errors
         */
          else {
            this.error.set(
              err.error?.message ||
              'Login failed. Please try again.'
            );
          }
        }
      });
  }
  /*
   * Destroy
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

