import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NoteFilterService {
  readonly searchQuery = signal('');
}
