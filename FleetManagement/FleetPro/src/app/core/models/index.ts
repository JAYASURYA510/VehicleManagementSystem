export enum UserRole {
  SuperAdmin = 0,
  Admin = 1,
  ManagingAuthority = 2,
  User = 3
}

export enum AppModule {
  Dashboard = 'Dashboard',
  Vehicles = 'Vehicles',
  Diesel = 'Diesel',
  Toll = 'Toll',
  Trip = 'Trip',
  Insurance = 'Insurance',
  Workshop = 'Workshop',
  Tyre = 'Tyre',
  Salary = 'Salary',
  RTO = 'RTO',
  Profit = 'Profit',
  Masters = 'Masters',
  Users = 'Users'
}

export enum ProfitType {
  Spend = 0,
  Return = 1
}

export interface Permission {
  module: AppModule;
  canView: boolean;
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  permissions: Permission[];
  assignedVehicleIds: number[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole | string;
  isActive: boolean;
  permissions: Permission[];
  assignedVehicleIds: number[];
}

export interface Vehicle {
  id: number;
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  driverName: string;
  isActive: boolean;
}

export interface Master {
  id: number;
  category: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DieselExpense {
  id: number;
  vehicleId: number;
  date: string;
  totalLitres: number;
  fuelStation: string;
  fromKm: number;
  toKm: number;
  kmBeforeFueling: number;
  totalKm: number;
  mileage: number;
  amount: number;
  notes?: string;
  vehicle?: Vehicle;
}

export interface TollCharge {
  id: number;
  vehicleId: number;
  date: string;
  tollPlaza: string;
  fromLocation: string;
  toLocation: string;
  amount: number;
  receiptNumber?: string;
  notes?: string;
  vehicle?: Vehicle;
}

export interface TripDetail {
  id: number;
  vehicleId: number;
  date: string;
  fromLocation: string;
  toLocation: string;
  purpose: string;
  driverName: string;
  startKm: number;
  endKm: number;
  totalKm: number;
  loadDetails?: string;
  revenue: number;
  notes?: string;
  vehicle?: Vehicle;
}

export interface Insurance {
  id: number;
  vehicleId: number;
  policyNumber: string;
  provider: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  coverageType: string;
  notes?: string;
  vehicle?: Vehicle;
}

export interface Workshop {
  id: number;
  vehicleId: number;
  date: string;
  workshopName: string;
  serviceType: string;
  description: string;
  amount: number;
  nextServiceDate?: string;
  notes?: string;
  vehicle?: Vehicle;
}

export interface Tyre {
  id: number;
  vehicleId: number;
  date: string;
  tyrePosition: string;
  brand: string;
  size: string;
  quantity: number;
  amount: number;
  kmAtChange: number;
  notes?: string;
  vehicle?: Vehicle;
}

export interface Salary {
  id: number;
  vehicleId?: number;
  employeeName: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  notes?: string;
  vehicle?: Vehicle;
}

export interface RTOCharge {
  id: number;
  vehicleId: number;
  date: string;
  chargeType: string;
  amount: number;
  receiptNumber?: string;
  validUntil?: string;
  notes?: string;
  vehicle?: Vehicle;
}

export interface ProfitRecord {
  id: number;
  vehicleId: number;
  date: string;
  description: string;
  type: ProfitType;
  category: string;
  amount: number;
  notes?: string;
  vehicle?: Vehicle;
}

export interface DashboardSummary {
  totalVehicles: number;
  activeVehicles: number;
  totalSpend: number;
  totalReturns: number;
  netProfit: number;
  totalDieselLitres: number;
  averageMileage: number;
  financialTrend: FinancialTrendPoint[];
  profitDistribution: ProfitDistribution[];
  vehicleSummaries: VehicleSummary[];
}

export interface FinancialTrendPoint {
  label: string;
  spend: number;
  returns: number;
  profit: number;
}

export interface ProfitDistribution {
  label: string;
  value: number;
}

export interface DailyRecordListItem {
  id: number;
  vehicleId: number;
  registrationNumber: string;
  date: string;
  totalSpend: number;
  tripRevenue: number;
  netAmount: number;
  notes?: string;
}

export interface VehicleSummary {
  vehicleId: number;
  registrationNumber: string;
  driverName: string;
  totalDiesel: number;
  totalToll: number;
  totalWorkshop: number;
  totalInsurance: number;
  totalTyre: number;
  totalSalary: number;
  totalRTO: number;
  totalSpend: number;
  totalReturns: number;
  netProfit: number;
  totalDieselLitres: number;
  averageMileage: number;
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  module: AppModule;
}
