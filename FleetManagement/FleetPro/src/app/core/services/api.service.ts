import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Role {
  id: number;
  roleName: string;
}

export interface Menu {
  id: number;
  menuName: string;
  icon: string;
  route: string;
  parentId: number | null;
  parentName: string | null;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:5236/api/Menu';
  constructor(private http: HttpClient) {}
  
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetRoles`);
  }
    getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/getAllMenu`);
  }
  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<T>(`${environment.apiUrl}/${path}`, { params: params as any });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${environment.apiUrl}/${path}`, body);
  }

  put(path: string, body: unknown) {
    return this.http.put(`${environment.apiUrl}/${path}`, body);
  }

  delete(path: string) {
    return this.http.delete(`${environment.apiUrl}/${path}`);
  }
}
