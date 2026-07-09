import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = signal('');
  loading = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username!, password!).subscribe({
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
