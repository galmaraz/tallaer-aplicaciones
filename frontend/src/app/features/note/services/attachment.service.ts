import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AttachmentRaw,
  AttachmentView,
  parseAttachmentView,
} from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attachment`;

  getAll(): Observable<AttachmentView[]> {
    return this.http
      .post<AttachmentRaw[]>(`${this.apiUrl}/getall`, {})
      .pipe(map(items => items.map(parseAttachmentView)));
  }

  getById(id: number): Observable<AttachmentView> {
    return this.http
      .post<AttachmentRaw>(`${this.apiUrl}/getbyid/${id}`, {})
      .pipe(map(parseAttachmentView));
  }

  getByNoteId(noteId: number): Observable<AttachmentView[]> {
    return this.http
      .post<AttachmentRaw[]>(`${this.apiUrl}/getbynote/${noteId}`, {})
      .pipe(map(items => items.map(parseAttachmentView)));
  }

  save(file: File, noteId: number): Observable<AttachmentView> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('note_id', String(noteId));
    return this.http
      .post<AttachmentRaw>(`${this.apiUrl}/save`, formData)
      .pipe(map(parseAttachmentView));
  }

  delete(id: number): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(
      `${this.apiUrl}/delete/${id}`,
      {},
    );
  }
}