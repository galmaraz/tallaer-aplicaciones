import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notecontroller`;

  getAll(): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/getall`, {});
  }

  getById(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getbyid/${id}`, {});
  }

  save(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete/${id}`, {});
  }
}