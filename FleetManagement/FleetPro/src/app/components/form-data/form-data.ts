import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Role, Menu } from '../../core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-form-data',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-data.html',
  styleUrls: ['./form-data.css']
})
export class FormDataComponent implements OnInit {

  roles: Role[] = [];
  menus: Menu[] = [];

 constructor(
  private apiService: ApiService,
  private cdr: ChangeDetectorRef
) {}

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
    }
  });
}

  loadMenus() {
  this.apiService.getMenus().subscribe({
    next: (res) => {
      this.menus = [...res];
    this.cdr.detectChanges();

      // console.log('Menus API Response:', res);
      // this.menus = res;
    },
    error: (err) => {
      console.error('Menus API Error:', err);
    }
  });
}


selectedPages: any[] = [];

onCheckboxChange(event: any, menu: any) {

  if (event.target.checked) {

    this.selectedPages.push(menu);

  } else {

    this.selectedPages = this.selectedPages.filter(
      x => x.id !== menu.id
    );

  }

  console.log(this.selectedPages);
}

isSelected(menu: any): boolean {
  return this.selectedPages.some(x => x.id === menu.id);
}





selectedRoleId: number | null = null;

selectedpages: any[] = [];

// Arrays for saving
roleArray: any[] = [];
pagesArray: any[] = [];

saveData() {

  const request = {
    roleId: this.selectedRoleId,
    pageId: this.selectedPages.map(page => page.id)
  };

  console.log(request);
}

resetForm() {

  this.selectedRoleId = null;
  this.selectedPages = [];
}
dropdownOpen = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

}
