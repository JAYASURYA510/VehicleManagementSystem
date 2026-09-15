
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  protected readonly unsubscribe$ = new Subject<void>();


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
    private apiService: ApiService,
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
  validateCustomer(): void {

    // Clear previous error
    this.error.set('');


    // Validate customer form
    if (this.customerForm.invalid) {

      this.customerForm.markAllAsTouched();

      return;

    }


    // Start loading
    this.loading.set(true);


    const customerId =
      this.customerForm
        .get('customerId')
        ?.value;


    /*
     * Call existing ApiService
     *
     * Endpoint:
     * /api/customer/validate
     */
    this.apiService
      .post('/api/customer/validate', {
        customerId: customerId
      })
      .subscribe({

        /*
         * Customer ID valid
         */
        next: (response: any) => {

          console.log(
            'Customer validation response:',
            response
          );

          this.loading.set(false);

          this.customerValidated.set(true);

          // Clear old error
          this.error.set('');

        },


        /*
         * Customer ID invalid
         */
        error: (err: any) => {

          this.loading.set(false);

          console.error(
            'Customer validation error:',
            err
          );


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


  /*
   * Login
   */
  onSubmit(): void {

    // Clear previous API error
    this.error.set('');

    // Validate form
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    // Start loading
    this.loading.set(true);


    const { username, password } = this.form.getRawValue();


    this.auth.login(username, password).subscribe({

        /*
         * Login Success
         */
        next: () => {

          this.loading.set(false);

        this.router.navigate(['/dashboard']);

        },


        /*
         * Login Error
         */
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

