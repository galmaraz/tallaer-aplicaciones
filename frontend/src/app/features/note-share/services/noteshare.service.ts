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

  /** Con qué usuarios está compartida una nota */
  getByNote(noteId: number): Observable<NoteShare[]> {
    return this.#http.post<NoteShare[]>(`${this.#baseUrl}/getbynote/${noteId}`, {});
  }

  /** Notas compartidas con un usuario */
  getByUser(userId: number): Observable<NoteShare[]> {
    return this.#http.post<NoteShare[]>(`${this.#baseUrl}/getbyuser/${userId}`, {});
  }

  save(payload: NoteSharePayload): Observable<unknown> {
    return this.#http.post(`${this.#baseUrl}/save`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.#http.post(`${this.#baseUrl}/deletebyid/${id}`, {});
  }
}