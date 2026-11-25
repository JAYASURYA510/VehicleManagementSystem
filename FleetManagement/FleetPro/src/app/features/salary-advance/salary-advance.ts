import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from '../../core/services/comman.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-salary-advance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary-advance.html',
  styleUrl: './salary-advance.css',
})
export class SalaryAdvance implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(CommanService);
  private alert = inject(ToastrService);
  private destroy$ = new Subject<void>();

  private localStorageData = JSON.parse(localStorage.getItem('fleetpro_user') || '{}');
  tenantId = localStorage.getItem('fleetPro_TenantId') || this.localStorageData.tenantId;
  currentUserId = this.localStorageData.userId;

  assignedId: string = '';
  assignedUserId: number | null = null;
  currentVehicleId: string = '';
  existingAdvanceId: string | null = null;
  isSubmitting = false;
  isLoading = false;

  salaryAdvanceForm: FormGroup = this.fb.group({
    vehicleId: [''],
    registrationNumber: [''],
    driverName: [''],
    salary: ['', [Validators.required, Validators.min(0), Validators.maxLength(10)]],
    advance: ['', [Validators.required, Validators.min(0), Validators.maxLength(10)]],
  });

  ngOnInit(): void {
    // 1. Read from router navigation state (history.state)
    const navState = history.state || {};
    let vId = navState.vehicleId || '';
    let regNo = navState.registrationNumber || '';
    let dName = navState.driverName || navState.userName || '';
    let aId = navState.assignedId || navState.assignmentId || '';
    let uId = navState.userId || '';

    // 2. Fallback to sessionStorage if not found in history.state (e.g. browser reload)
    if (!aId && !vId) {
      try {
        const stored = sessionStorage.getItem('fleetpro_salary_advance');
        if (stored) {
          const parsed = JSON.parse(stored);
          vId = vId || parsed.vehicleId || '';
          regNo = regNo || parsed.registrationNumber || '';
          dName = dName || parsed.driverName || parsed.userName || '';
          aId = aId || parsed.assignedId || parsed.assignmentId || '';
          uId = uId || parsed.userId || '';
        }
      } catch (e) {
        console.error('Failed to parse stored salary advance data', e);
      }
    }

    this.currentVehicleId = vId;
    this.assignedId = aId;
    if (uId) {
      this.assignedUserId = Number(uId);
    }

    this.salaryAdvanceForm.patchValue({
      vehicleId: this.currentVehicleId,
      registrationNumber: regNo,
      driverName: dName
    });

    if (this.assignedId && this.tenantId) {
      this.loadExistingAdvanceSalary(this.assignedId);
    }
  }

  loadExistingAdvanceSalary(assignedId: string): void {
    this.isLoading = true;
    this.apiService
      .list(`AdvanceSalary/${this.tenantId}/getAdvanceSalaryByAssignId/${assignedId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          const data = Array.isArray(response?.data)
            ? (response.data.length > 0 ? response.data[0] : null)
            : response?.data;

          if (data && (data.advanceId || data.AdvanceId)) {
            this.existingAdvanceId = data.advanceId ?? data.AdvanceId;
            this.salaryAdvanceForm.patchValue({
              salary: data.salaryAmount ?? data.SalaryAmount ?? '',
              advance: data.advanceAmount ?? data.AdvanceAmount ?? '',
              driverName: data.userName ?? data.UserName ?? this.salaryAdvanceForm.get('driverName')?.value,
              registrationNumber: data.vehicleNumber ?? data.VehicleNumber ?? this.salaryAdvanceForm.get('registrationNumber')?.value,
              vehicleId: data.vehicleId ?? data.VehicleId ?? this.salaryAdvanceForm.get('vehicleId')?.value,
            });
            if (data.userId ?? data.UserId) {
              this.assignedUserId = Number(data.userId ?? data.UserId);
            }
            if (data.vehicleId ?? data.VehicleId) {
              this.currentVehicleId = data.vehicleId ?? data.VehicleId;
            }
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Failed to get advance salary by assignedId:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.salaryAdvanceForm.invalid) {
      this.salaryAdvanceForm.markAllAsTouched();
      return;
    }

    if (!this.tenantId) {
      this.alert.error('Tenant ID not found. Please log in again.');
      return;
    }

    if (!this.assignedId) {
      this.alert.error('Assigned ID is missing. Cannot save advance salary.');
      return;
    }

    if (!this.currentVehicleId) {
      this.currentVehicleId = this.salaryAdvanceForm.get('vehicleId')?.value;
    }

    if (!this.currentVehicleId) {
      this.alert.error('Vehicle ID is missing.');
      return;
    }

    if (!this.assignedUserId) {
      this.alert.error('User ID is missing.');
      return;
    }

    const formValues = this.salaryAdvanceForm.getRawValue();
    this.isSubmitting = true;

    if (this.existingAdvanceId) {
      // Update existing record
      const updatePayload = {
        advanceId: this.existingAdvanceId,
        assignedId: this.assignedId,
        vehicleId: this.currentVehicleId,
        userId: Number(this.assignedUserId),
        tenantId: this.tenantId,
        advanceAmount: String(formValues.advance ?? '0'),
        salaryAmount: String(formValues.salary ?? '0'),
        isActive: true,
        updatedBy: this.currentUserId ? Number(this.currentUserId) : null,
        updatedDate: new Date().toISOString()
      };

      this.apiService
        .update(`AdvanceSalary/${this.tenantId}/updateAdvanceSalary`, updatePayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            if (response?.success !== false) {
              this.alert.success(response?.message || 'Advance salary details updated successfully.');
              sessionStorage.removeItem('fleetpro_salary_advance');
              this.router.navigate(['/assign-vehicle-list']);
            } else {
              this.alert.error(response?.message || 'Failed to update advance salary details.');
            }
          },
          error: (error: any) => {
            this.isSubmitting = false;
            this.alert.error(error?.error?.message || 'Error updating advance salary details.');
          }
        });
    } else {
      // Create new record
      const createPayload = {
        assignedId: this.assignedId,
        vehicleId: this.currentVehicleId,
        userId: Number(this.assignedUserId),
        tenantId: this.tenantId,
        advanceAmount: String(formValues.advance ?? '0'),
        salaryAmount: String(formValues.salary ?? '0'),
        isActive: true,
        createdBy: this.currentUserId ? Number(this.currentUserId) : null,
        createdDate: new Date().toISOString()
      };

      this.apiService
        .create(`AdvanceSalary/${this.tenantId}/saveAdvanceSalary`, createPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            if (response?.success !== false) {
              this.alert.success(response?.message || 'Advance salary details saved successfully.');
              sessionStorage.removeItem('fleetpro_salary_advance');
              this.router.navigate(['/assign-vehicle-list']);
            } else {
              this.alert.error(response?.message || 'Failed to save advance salary details.');
            }
          },
          error: (error: any) => {
            this.isSubmitting = false;
            this.alert.error(error?.error?.message || 'Error saving advance salary details.');
          }
        });
    }
  }

  goBack(): void {
    sessionStorage.removeItem('fleetpro_salary_advance');
    this.router.navigate(['/assign-vehicle-list']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
