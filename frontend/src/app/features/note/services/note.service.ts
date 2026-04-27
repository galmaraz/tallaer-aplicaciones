import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NoteRaw, NoteView, parseNoteView } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notecontroller`;

  getAll(): Observable<NoteView[]> {
    return this.http
      .post<NoteRaw[]>(`${this.apiUrl}/getall`, {})
      .pipe(map(notes => notes.map(parseNoteView)));
  }

  getTrash(): Observable<NoteView[]> {
    return this.http
      .post<NoteRaw[]>(`${this.apiUrl}/gettrash`, {})
      .pipe(map(notes => notes.map(parseNoteView)));
  }

  getById(id: number): Observable<NoteView> {
    return this.http
      .post<NoteRaw>(`${this.apiUrl}/getbyid/${id}`, {})
      .pipe(map(parseNoteView));
  }

  save(data: NoteRaw): Observable<NoteView> {
    return this.http
      .post<NoteRaw>(`${this.apiUrl}/save`, data)
      .pipe(map(parseNoteView));
  }

  softDelete(id: number): Observable<NoteView> {
    return this.http
      .post<NoteRaw>(`${this.apiUrl}/softdelete/${id}`, {})
      .pipe(map(parseNoteView));
  }

  restore(id: number): Observable<NoteView> {
    return this.http
      .post<NoteRaw>(`${this.apiUrl}/restore/${id}`, {})
      .pipe(map(parseNoteView));
  }

  delete(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete/${id}`, {});
  }
}
