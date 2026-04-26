import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NoteShareService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notesharecontroller`;


  compartir(idNota: number, idUsuario: number) {
    const body = {
        role: 1, 
        note: { id: idNota },  
        usuario: { id: idUsuario }
      };
    return this.http.post(`${this.apiUrl}/save`, body, { responseType: 'text' });
  }


}