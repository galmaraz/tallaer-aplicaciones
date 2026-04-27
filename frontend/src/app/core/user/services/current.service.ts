import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly #STORAGE_KEY = 'currentUserId';

  readonly currentUserId = signal<number | null>(this.#readFromStorage());

  constructor() {
    effect(() => {
      const id = this.currentUserId();
      if (id === null) {
        localStorage.removeItem(this.#STORAGE_KEY);
      } else {
        localStorage.setItem(this.#STORAGE_KEY, String(id));
      }
    });
  }

  setCurrentUserId(id: number | null): void {
    this.currentUserId.set(id);
  }

  clear(): void {
    this.currentUserId.set(null);
  }

  #readFromStorage(): number | null {
    const raw = localStorage.getItem(this.#STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
}