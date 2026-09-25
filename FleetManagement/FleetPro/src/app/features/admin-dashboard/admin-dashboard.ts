import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NewonboardClientComponent } from '../newonboard-client/newonboard-client';
import { AdminSubscriptionComponent } from '../admin-subscription/admin-subscription';

export type DashboardView = 'profile' | 'subscription';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NewonboardClientComponent,
    AdminSubscriptionComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  client: any = null;
  activeView: DashboardView = 'profile';

  navItems: { view: DashboardView; icon: string; label: string }[] = [
    { view: 'profile', icon: 'manage_accounts', label: 'Profile' },
    { view: 'subscription', icon: 'card_membership', label: 'Subscription' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Read client data passed via router state
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['client']) {
      this.client = nav.extras.state['client'];
    } else if (history.state?.client) {
      this.client = history.state.client;
    }
  }

  setView(view: DashboardView): void {
    this.activeView = view;
  }

  goBack(): void {
    this.router.navigate(['/superAdminList']);
  }
}
