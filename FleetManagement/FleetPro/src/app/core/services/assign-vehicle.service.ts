import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignVehicleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment?.apiUrl || 'https://localhost:7236/api';

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/User/getallUserForSelection`);
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/UserRole/roleForLogin`);
  }

  getActiveVehicles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/VehicleMst/getActiveAllVehicle`);
  }

  assignVehicle(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/VehicleMst/AssignVehicle`, data);
  }
}