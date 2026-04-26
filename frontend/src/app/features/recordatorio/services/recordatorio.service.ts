import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Recordatorio, RecordatorioDto } from '../models/recordatorio.model';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/recordatorios`;

  listar(): Observable<Recordatorio[]> {
    return this.http.get<Recordatorio[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Recordatorio> {
    return this.http.get<Recordatorio>(`${this.apiUrl}/${id}`);
  }

  crear(data: RecordatorioDto): Observable<Recordatorio> {
    return this.http.post<Recordatorio>(this.apiUrl, data);
  }

  actualizar(id: number, data: RecordatorioDto): Observable<Recordatorio> {
    return this.http.put<Recordatorio>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  completar(id: number): Observable<Recordatorio> {
    return this.http.patch<Recordatorio>(`${this.apiUrl}/${id}/completar`, {});
  }
}
