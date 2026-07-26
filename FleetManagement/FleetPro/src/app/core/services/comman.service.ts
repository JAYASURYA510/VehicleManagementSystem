import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommanService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(url: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${url}`);
  }

  create(url: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${url}`, data);
  }

  update(url: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${url}`, data);
  }

  delete(url: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${url}`);
  }

  listsubcategory(url: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${url}`);
  }
}