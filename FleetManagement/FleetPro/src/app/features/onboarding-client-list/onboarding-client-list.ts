import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommanService } from '../../core/services/comman.service';

@Component({
  selector: 'app-onboarding-client-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './onboarding-client-list.html',
  styleUrl: './onboarding-client-list.css',
})
export class OnboardingClientList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected readonly unsubscribe$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter state
  activeTab: 'all' | 'active' | 'inactive' | 'hold' = 'all';
  searchTerm = '';
  selectedType = '';
  selectedMode = '';

  // Table
  displayedColumns: string[] = [
    'id', 'customerName', 'activatedOn', 'type', 'status', 'actions'
  ];

  dataSource =new MatTableDataSource<any>([]);

  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalRecords = 0;
  totalPages = 0;
  startRecord = 0;
  endRecord = 0;
  filter : any;
  isfilter: boolean | undefined;

  constructor(private apiService: CommanService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // TODO: load data via apiService
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
     this.apiService.list(`Tenant/getAdminDetails`).pipe(takeUntil(this.unsubscribe$)).subscribe((response: any) => {
      if(response.success == true){
        this.filter = Array.isArray(response.message) ? response.message : [];
        this.dataSource.data = this.filter;
        this.totalRecords = this.dataSource.data.length;
        this.cdr.detectChanges();
      }
    },(error) =>{
       console.error('Facing Error', error)
   });
    this.updatePaginationInfo();
  }

  onTabChange(tab: 'all' | 'active' | 'inactive' | 'hold'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  reset(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedMode = '';
    this.activeTab = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    this.isfilter = this.activeTab === 'active' ? true : this.activeTab === 'inactive' ? false : undefined;

    const data = this.isfilter === undefined ? this.filter
      : this.filter.filter((x: any) => x.isActive === this.isfilter);

    this.dataSource.data = data;
    this.totalRecords = data.length;
    this.updatePaginationInfo();
  }

  updatePaginationInfo(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
    const page = this.paginator?.pageIndex ?? 0;
    this.startRecord = this.totalRecords === 0 ? 0 : page * this.pageSize + 1;
    this.endRecord = Math.min((page + 1) * this.pageSize, this.totalRecords);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    if (this.paginator) {
      this.paginator.pageSize = size;
      this.paginator.firstPage();
    }
    this.updatePaginationInfo();
  }

  firstPage(): void { this.paginator?.firstPage(); this.updatePaginationInfo(); }
  previousPage(): void { this.paginator?.previousPage(); this.updatePaginationInfo(); }
  nextPage(): void { this.paginator?.nextPage(); this.updatePaginationInfo(); }
  lastPage(): void { this.paginator?.lastPage(); this.updatePaginationInfo(); }
}
