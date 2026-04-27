import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NoteShare, NoteSharePayload } from '../models/noteshare.interface';

@Injectable({ providedIn: 'root' })
export class NoteShareService {
  #http = inject(HttpClient);
  #baseUrl = `${environment.apiUrl}/notesharecontroller`;

  getAll(): Observable<NoteShare[]> {
    return this.#http.post<NoteShare[]>(`${this.#baseUrl}/getall`, {});
  }

  getByNote(noteId: number): Observable<NoteShare[]> {
    return this.#http.post<NoteShare[]>(`${this.#baseUrl}/getbynote/${noteId}`, {});
  }

  getByUser(userId: number): Observable<NoteShare[]> {
    return this.#http.post<NoteShare[]>(`${this.#baseUrl}/getbyuser/${userId}`, {});
  }

  save(payload: NoteSharePayload): Observable<string> {
    return this.#http.post(`${this.#baseUrl}/save`, payload, { responseType: 'text' });
  }

  delete(id: number): Observable<string> {
    return this.#http.post(`${this.#baseUrl}/deletebyid/${id}`, {}, { responseType: 'text' });
  }
}