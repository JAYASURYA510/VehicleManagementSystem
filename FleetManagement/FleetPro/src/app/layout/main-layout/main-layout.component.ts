import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(this.getInitialSidebarState());
  userDropdownOpen = signal(false);
  userMenuRef = viewChild<ElementRef>('userMenuRef');

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

  roleLabel(): string {
    const role = this.auth.role();
    if (role === UserRole.SuperAdmin || role === 'SuperAdmin') return 'Super Admin';
    if (role === UserRole.Admin || role === 'Admin') return 'Admin';
    if (role === UserRole.ManagingAuthority || role === 'ManagingAuthority') return 'Managing Authority';
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
