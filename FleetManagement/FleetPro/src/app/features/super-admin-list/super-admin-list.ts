import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommanService } from '../../core/services/comman.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-super-admin-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatIconModule, RouterLink],
  templateUrl: './super-admin-list.html',
  styleUrl: './super-admin-list.css',
})
export class SuperAdminList {
  protected readonly unsubscribe$ = new Subject<void>();
  dataSource =new MatTableDataSource<any>([]);
  @ViewChild(MatSort) sort!: MatSort;

   displayedColumns: string[] = [
  'id',
  'customerName',
  'email',
  'phoneNo',
  'view',
  'actions'
  ];

  constructor(private apiService : CommanService, private cdr : ChangeDetectorRef, private router: Router){}

  openAdminDashBoard(user: any): void {
    this.router.navigate(['/superAdminList/adminDashboard'], {
      state: { client: user }
    });
  }


  ngOnInit(){
    this.getSuperAdminList();
  }

  ngAfterViewInit() {
  this.dataSource.sort = this.sort;
}

  getSuperAdminList(){
    this.apiService.list(`Tenant/getSuperAdmin`).pipe(takeUntil(this.unsubscribe$)).subscribe((response: any) => {
      if(response.success == true){
        this.dataSource.data = response.message;
        this.cdr.detectChanges();
      }
    },(error) =>{
       console.error('Facing Error', error)
   });
  }
}
