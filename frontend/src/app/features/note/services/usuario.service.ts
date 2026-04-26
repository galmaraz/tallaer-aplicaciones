import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService { 
  private readonly http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/usuariocontroller`;

  getAll() {
    return this.http.post<any[]>(`${this.apiUrl}/getall`, {});
  }
}