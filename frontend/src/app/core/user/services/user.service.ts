import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  #http = inject(HttpClient);
  #baseUrl = `${environment.apiUrl}/usuariocontroller`;

  getAll(): Observable<User[]> {
    return this.#http.get<User[]>(this.#baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.#http.post<User>(`${this.#baseUrl}/getbyid/${id}`, {});
  }
}