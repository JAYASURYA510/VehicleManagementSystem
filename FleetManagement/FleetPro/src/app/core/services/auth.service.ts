import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppModule, LoginResponse, Permission, UserRole } from '../models';

const TOKEN_KEY = 'fleetpro_token';
const USER_KEY = 'fleetpro_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<LoginResponse | null>(this.loadUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser()?.token);
  readonly fullName = computed(() => this.currentUser()?.fullName ?? '');
  readonly role = computed(() => this.currentUser()?.role);
  readonly permissions = computed(() => this.currentUser()?.permissions ?? []);

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasPermission(module: AppModule, action: 'View' | 'Read' | 'Write' | 'Edit' = 'Read'): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (this.isSuperAdmin(user.role)) return true;

    const perm = user.permissions.find(p => String(p.module) === String(module));
    if (!perm) return false;

    switch (action) {
      case 'View': return perm.canView;
      case 'Read': return perm.canRead || perm.canView;
      case 'Write': return perm.canWrite;
      case 'Edit': return perm.canEdit;
    }
  }

  private isSuperAdmin(role: UserRole | string): boolean {
    return role === UserRole.SuperAdmin || role === 'SuperAdmin';
  }

  isAdminOrSuperAdmin(): boolean {
    const role = this.role();
    return this.isSuperAdmin(role!) || role === UserRole.Admin || role === 'Admin';
  }

  private loadUser(): LoginResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
