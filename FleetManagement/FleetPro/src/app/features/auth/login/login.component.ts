import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected readonly unsubscribe$ = new Subject<void>();
  form : any;
  roleList : any;
  constructor(
     private fb : FormBuilder, private auth : AuthService,
     private router : Router
  ) {
    this.form = this.fb.group({
    username: ['', Validators.required],
    roleId : ['', Validators.required],
    password: ['', Validators.required]
    });
  }

    ngOnInit(): void {
    this.loadRole();
  }

  error = signal('');
  loading = signal(false);


  loadRole(){
    debugger;
   this.auth.getRoleForLog().pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
    this.roleList = data;
   });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username,roleId, password } = this.form.getRawValue();
    this.auth.login(username!,roleId!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Cannot connect to API. Start the backend: cd FleetPro.API && dotnet run');
        } else if (err.status === 401) {
          this.error.set('Invalid username or password');
        } else {
          this.error.set(err.error?.message ?? 'Login failed. Please try again.');
        }
      }
    });
  }
}
