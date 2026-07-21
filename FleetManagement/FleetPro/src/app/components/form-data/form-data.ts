import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Role, Menu } from '../../core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-data',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-data.html',
  styleUrls: ['./form-data.css'],
})
export class FormDataComponent implements OnInit {
  roles: Role[] = [];
  menus: Menu[] = [];
  permissionForm: FormGroup;
  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.permissionForm = this.fb.group({
      selectedRoleId: new FormControl(null, Validators.required),
      // selectedPages: new FormControl([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadMenus();
  }

  loadRoles() {
    this.apiService.getRoles().subscribe({
      next: (res) => {
        this.roles = [...res];
        this.cdr.detectChanges();

        // console.log('Roles API Response:', res);
        // this.roles = res;
      },
      error: (err) => {
        console.error('Roles API Error:', err);
      },
    });
  }

  loadMenus() {
    this.apiService.getMenus().subscribe({
      next: (res) => {
        this.menus = [...res];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Menus API Error:', err);
      },
    });
  }

  selectedPages: any[] = [];

  onCheckboxChange(event: any, menu: any) {
    if (event.target.checked) {
      this.selectedPages.push(menu);
    } else {
      this.selectedPages = this.selectedPages.filter((x) => x.id !== menu.id);
    }

    console.log(this.selectedPages);
  }

  isSelected(menu: any): boolean {
    return this.selectedPages.some((x) => x.id === menu.id);
  }

  selectedRoleId: number | null = null;

  selectedpages: any[] = [];

  // Arrays for saving
  roleArray: any[] = [];
  pagesArray: any[] = [];

  saveData() {
    const payload = {
      roleId: this.permissionForm.get('selectedRoleId')?.value,
      MenuIds: this.selectedPages.map((page) => page.id),
    }

    this.apiService.post("Menu/SaveMenu", payload).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
        alert('Role permissions saved successfully.');
        this.reset();
    },
    (error) => {
      alert('Failed to save role permissions.');
    });
  }

  resetForm() {
    this.permissionForm.get('selectedRoleId')?.setValue(null);
    this.selectedRoleId = null;
    this.selectedPages = [];
  }
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  reset() {
    this.selectedPages = [];
    this.dropdownOpen = false;
  }
}
