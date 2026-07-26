import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommanService } from '../../core/services/comman.service';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  protected readonly unsubscribe$ = new Subject<void>();
  auth = inject(AuthService);
  sidebarOpen = signal(this.getInitialSidebarState());
  userDropdownOpen = signal(false);
  userMenuRef = viewChild<ElementRef>('userMenuRef');
  getRoleId : any;
  navList : any;

  constructor(
       private fb : FormBuilder,private api : CommanService, private cdr: ChangeDetectorRef,
       private router : Router
    ) {}

  ngOnInit(){
   this.getNavList();
  }
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '▦' },
    { label: 'Daily Tracking', route: '/daily-tracking', icon: '☰' },
    { label: 'Vehicles Master', route: '/vehicles', icon: '🚛', adminOnly: true },
    { label: 'Users Master', route: '/users', icon: '👥', adminOnly: true }
  ];

  visibleNavItems = () => this.navItems.filter(item =>
    !item.adminOnly || this.auth.isAdminOrSuperAdmin()
  );

  displayName(): string {
    const name = this.auth.fullName() || this.auth.user()?.username || 'User';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  userInitials(): string {
    const name = this.auth.fullName() || this.auth.user()?.username || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getNavList(): void {
     const role = this.auth.role();
    if (role === UserRole.SuperAdmin || role === 'SuperAdmin') {
      this.getRoleId = 1;
    }
    if (role === UserRole.Admin || role === 'Admin') {
      this.getRoleId = 2;
    }
    if (role === UserRole.Manager || role === 'Manager') {
      this.getRoleId = 3;
    }
    if (role === UserRole.Driver || role === 'Driver') {
      this.getRoleId = 4;
    }

    this.api.list(`Menu/GetMenuByRoleId/${this.getRoleId}`).pipe(takeUntil(this.unsubscribe$)).subscribe((data : any)=>{
      this.navList = [];
      this.navList = data;
       this.cdr.detectChanges();
      console.log("Menu Data" , data)
   });
  }

  roleLabel(): string {
    const role = this.auth.role();
    if (role === UserRole.SuperAdmin || role === 'SuperAdmin') return 'Super Admin';
    if (role === UserRole.Admin || role === 'Admin') return 'Admin';
    if (role === UserRole.Manager || role === 'Manager') return 'Manager';
    return 'User';
  }

  private getInitialSidebarState(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  }

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void { this.sidebarOpen.set(false); }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen.update(v => !v);
  }

  closeUserDropdown(): void { this.userDropdownOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const menuEl = this.userMenuRef()?.nativeElement;
    if (menuEl && !menuEl.contains(event.target)) {
      this.closeUserDropdown();
    }
  }

  logout(): void {
    this.closeUserDropdown();
    this.auth.logout();
  }
}
