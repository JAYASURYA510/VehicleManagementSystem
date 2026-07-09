import { Component, OnInit, inject } from '@angular/core';
import { ExpensePageComponent, ExpensePageConfig } from '../../shared/expense-page/expense-page.component';
import { ApiService } from '../../core/services/api.service';
import { AppModule } from '../../core/models';

const vehicleField = (vehicles: { id: number; registrationNumber: string }[]) => ({
  key: 'vehicleId',
  label: 'Vehicle',
  type: 'select' as const,
  options: vehicles.map(v => ({ value: v.id, label: v.registrationNumber })),
  required: true
});

@Component({
  selector: 'app-diesel',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class DieselComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Diesel Expenses',
        apiPath: 'dieselExpenses',
        module: AppModule.Diesel,
        defaultItem: { date: new Date().toISOString().substring(0, 10), totalLitres: 0, fromKm: 0, toKm: 0, kmBeforeFueling: 0, totalKm: 0, mileage: 0, amount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'totalLitres', label: 'Total Litres', type: 'number' },
          { key: 'fuelStation', label: 'Fuel Station', type: 'text' },
          { key: 'fromKm', label: 'From KM', type: 'number' },
          { key: 'toKm', label: 'To KM', type: 'number' },
          { key: 'kmBeforeFueling', label: 'KM Before Fueling', type: 'number' },
          { key: 'totalKm', label: 'Total KM', type: 'number' },
          { key: 'mileage', label: 'Mileage', type: 'number' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-toll',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class TollComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Toll Charges',
        apiPath: 'tollCharges',
        module: AppModule.Toll,
        defaultItem: { date: new Date().toISOString().substring(0, 10), amount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'tollPlaza', label: 'Toll Plaza', type: 'text' },
          { key: 'fromLocation', label: 'From', type: 'text' },
          { key: 'toLocation', label: 'To', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'receiptNumber', label: 'Receipt No.', type: 'text' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-trips',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class TripsComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Trip Details',
        apiPath: 'tripDetails',
        module: AppModule.Trip,
        defaultItem: { date: new Date().toISOString().substring(0, 10), startKm: 0, endKm: 0, totalKm: 0, revenue: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'fromLocation', label: 'From', type: 'text' },
          { key: 'toLocation', label: 'To', type: 'text' },
          { key: 'purpose', label: 'Purpose', type: 'text' },
          { key: 'driverName', label: 'Driver', type: 'text' },
          { key: 'startKm', label: 'Start KM', type: 'number' },
          { key: 'endKm', label: 'End KM', type: 'number' },
          { key: 'totalKm', label: 'Total KM', type: 'number' },
          { key: 'revenue', label: 'Revenue', type: 'number', format: 'currency' },
          { key: 'loadDetails', label: 'Load Details', type: 'textarea', tableColumn: false },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-insurance',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class InsuranceComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Insurance',
        apiPath: 'insurances',
        module: AppModule.Insurance,
        defaultItem: { startDate: new Date().toISOString().substring(0, 10), endDate: '', premiumAmount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'policyNumber', label: 'Policy Number', type: 'text' },
          { key: 'provider', label: 'Provider', type: 'text' },
          { key: 'startDate', label: 'Start Date', type: 'date', format: 'date' },
          { key: 'endDate', label: 'End Date', type: 'date', format: 'date' },
          { key: 'premiumAmount', label: 'Premium', type: 'number', format: 'currency' },
          { key: 'coverageType', label: 'Coverage Type', type: 'text' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-workshop',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class WorkshopComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Workshop',
        apiPath: 'workshops',
        module: AppModule.Workshop,
        defaultItem: { date: new Date().toISOString().substring(0, 10), amount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'workshopName', label: 'Workshop', type: 'text' },
          { key: 'serviceType', label: 'Service Type', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'nextServiceDate', label: 'Next Service', type: 'date', format: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-tyre',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class TyreComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Tyre',
        apiPath: 'tyres',
        module: AppModule.Tyre,
        defaultItem: { date: new Date().toISOString().substring(0, 10), quantity: 1, amount: 0, kmAtChange: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'tyrePosition', label: 'Position', type: 'text' },
          { key: 'brand', label: 'Brand', type: 'text' },
          { key: 'size', label: 'Size', type: 'text' },
          { key: 'quantity', label: 'Quantity', type: 'number' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'kmAtChange', label: 'KM at Change', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-salary',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class SalaryComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Salary',
        apiPath: 'salaries',
        module: AppModule.Salary,
        defaultItem: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0 },
        fields: [
          { key: 'vehicleId', label: 'Vehicle (Optional)', type: 'select', options: [{ value: '', label: 'None' }, ...vehicles.map(v => ({ value: v.id, label: v.registrationNumber }))], required: false },
          { key: 'employeeName', label: 'Employee', type: 'text' },
          { key: 'month', label: 'Month', type: 'number' },
          { key: 'year', label: 'Year', type: 'number' },
          { key: 'basicSalary', label: 'Basic Salary', type: 'number', format: 'currency' },
          { key: 'allowances', label: 'Allowances', type: 'number', format: 'currency' },
          { key: 'deductions', label: 'Deductions', type: 'number', format: 'currency' },
          { key: 'netSalary', label: 'Net Salary', type: 'number', format: 'currency' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-rto',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class RtoComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'RTO Charges',
        apiPath: 'rtoCharges',
        module: AppModule.RTO,
        defaultItem: { date: new Date().toISOString().substring(0, 10), amount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'chargeType', label: 'Charge Type', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'receiptNumber', label: 'Receipt No.', type: 'text' },
          { key: 'validUntil', label: 'Valid Until', type: 'date', format: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}

@Component({
  selector: 'app-profit',
  imports: [ExpensePageComponent],
  template: `<app-expense-page [config]="config" />`
})
export class ProfitComponent implements OnInit {
  private api = inject(ApiService);
  config!: ExpensePageConfig;

  ngOnInit(): void {
    this.api.get<{ id: number; registrationNumber: string }[]>('vehicles').subscribe(vehicles => {
      this.config = {
        title: 'Profit / Loss',
        apiPath: 'profitRecords',
        module: AppModule.Profit,
        defaultItem: { date: new Date().toISOString().substring(0, 10), type: 0, amount: 0 },
        fields: [
          vehicleField(vehicles),
          { key: 'date', label: 'Date', type: 'date', format: 'date' },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'type', label: 'Type', type: 'select', options: [{ value: 0, label: 'Spend' }, { value: 1, label: 'Return' }] },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'number', format: 'currency' },
          { key: 'notes', label: 'Notes', type: 'textarea', tableColumn: false }
        ]
      };
    });
  }
}
