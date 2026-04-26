import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioCompartirService {
  private http = inject(HttpClient);
  private URL = `${environment.apiUrl}/usuariocontroller`;

  getTodosLosUsuarios() {
    return this.http.post<any[]>(`${this.URL}/getall`, {});
  }
}