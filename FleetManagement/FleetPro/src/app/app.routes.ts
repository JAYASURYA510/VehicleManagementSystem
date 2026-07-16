import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { UsersComponent } from './features/users/users.component';
import { VehiclesComponent } from './features/vehicles/vehicles.component';
import { DailyTrackingComponent } from './features/daily-tracking/daily-tracking.component';
import { authGuard } from './core/guards/auth.guard';
import { AppModule } from './core/models';
import { FormDataComponent } from './components/form-data/form-data';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
       {
    path: 'form-data',
    component: FormDataComponent
  },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'daily-tracking', component: DailyTrackingComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'users', component: UsersComponent },
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
