import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

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
