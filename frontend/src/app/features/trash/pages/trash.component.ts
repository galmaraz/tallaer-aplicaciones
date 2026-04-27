import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NoteView } from '../../note/models/note.model';
import { NoteService } from '../../note/services/note.service';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './trash.component.html',
})
export class TrashComponent implements OnInit {
  #noteService = inject(NoteService);

  notes = signal<NoteView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  restoringId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  readonly isEmpty = computed(() => !this.loading() && this.notes().length === 0);

  ngOnInit(): void {
    this.#load();
  }

  #load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.#noteService.getTrash().subscribe({
      next: (data) => {
        this.notes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la papelera.');
        this.loading.set(false);
      },
    });
  }

  restore(id: number): void {
    this.restoringId.set(id);
    this.#noteService.restore(id).subscribe({
      next: () => {
        this.notes.update(notes => notes.filter(n => n.id !== id));
        this.restoringId.set(null);
      },
      error: () => this.restoringId.set(null),
    });
  }

  requestConfirmDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  permanentDelete(id: number): void {
    this.confirmDeleteId.set(null);
    this.deletingId.set(id);
    this.#noteService.delete(id).subscribe({
      next: () => {
        this.notes.update(notes => notes.filter(n => n.id !== id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }
}
