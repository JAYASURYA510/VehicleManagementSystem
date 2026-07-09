import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { UsersComponent } from './features/users/users.component';
import { VehiclesComponent } from './features/vehicles/vehicles.component';
import { DailyTrackingComponent } from './features/daily-tracking/daily-tracking.component';
import { authGuard, permissionGuard, adminGuard } from './core/guards/auth.guard';
import { AppModule } from './core/models';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [permissionGuard(AppModule.Dashboard, 'View')] },
      { path: 'daily-tracking', component: DailyTrackingComponent, canActivate: [permissionGuard(AppModule.Diesel, 'View')] },
      { path: 'vehicles', component: VehiclesComponent, canActivate: [adminGuard] },
      { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
      { path: 'diesel', redirectTo: 'daily-tracking' },
      { path: 'toll', redirectTo: 'daily-tracking' },
      { path: 'trips', redirectTo: 'daily-tracking' },
      { path: 'insurance', redirectTo: 'daily-tracking' },
      { path: 'workshop', redirectTo: 'daily-tracking' },
      { path: 'tyre', redirectTo: 'daily-tracking' },
      { path: 'salary', redirectTo: 'daily-tracking' },
      { path: 'rto', redirectTo: 'daily-tracking' },
      { path: 'profit', redirectTo: 'daily-tracking' },
      { path: 'masters', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
