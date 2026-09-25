import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-admin-subscription',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-subscription.html',
  styleUrl: './admin-subscription.css'
})
export class AdminSubscriptionComponent implements OnInit {
  @Input() client: any = null;

  selectedPlanId: string | null = null;
  currentPlanId: string | null = 'basic';
  isActivating = false;

  plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 999,
      billingCycle: 'month',
      description: 'Ideal for small fleets getting started.',
      features: [
        'Up to 10 vehicles',
        'Daily tracking',
        'Basic reports',
        'Email support',
        '1 admin user'
      ],
      color: '#3b82f6',
      icon: 'directions_car'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2499,
      billingCycle: 'month',
      description: 'Perfect for growing businesses with advanced needs.',
      features: [
        'Up to 50 vehicles',
        'Real-time GPS tracking',
        'Advanced reports & analytics',
        'Priority email & chat support',
        '5 admin users',
        'Driver management',
        'Fuel & expense tracking'
      ],
      isPopular: true,
      color: '#7e3285',
      icon: 'local_shipping'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 5999,
      billingCycle: 'month',
      description: 'Full-scale solution for large enterprise fleets.',
      features: [
        'Unlimited vehicles',
        'Real-time GPS + live alerts',
        'Custom reports & dashboards',
        '24/7 dedicated support',
        'Unlimited admin users',
        'API integrations',
        'Multi-branch management',
        'Custom branding'
      ],
      color: '#ea580c',
      icon: 'corporate_fare'
    }
  ];

  constructor(private toast: ToastrService) {}

  ngOnInit(): void {
    this.selectedPlanId = this.currentPlanId;
  }

  selectPlan(planId: string): void {
    this.selectedPlanId = planId;
  }

  get selectedPlan(): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === this.selectedPlanId);
  }

  get currentPlan(): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === this.currentPlanId);
  }

  activatePlan(): void {
    if (!this.selectedPlanId || this.selectedPlanId === this.currentPlanId) return;
    this.isActivating = true;
    // Simulate API call
    setTimeout(() => {
      this.currentPlanId = this.selectedPlanId;
      this.isActivating = false;
      this.toast.success(`${this.selectedPlan?.name} plan activated successfully!`);
    }, 1200);
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentPlanId === planId;
  }

  isSelectedPlan(planId: string): boolean {
    return this.selectedPlanId === planId;
  }
}
