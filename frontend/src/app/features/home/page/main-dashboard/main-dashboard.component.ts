import { Component, computed, inject, signal } from '@angular/core';
import { NoteView } from '../../../note/models/note.model';
import { NoteService } from '../../../note/services/note.service';
import { NoteFilterService } from '../../../note/services/note-filter.service';
import { NoteEditorComponent } from '../../../note/components/note-editor/note-editor.component';
import { NoteCardComponent } from '../../../note/components/note-card/note-card.component';

type ViewMode = 'grid' | 'list';

const byNewest = (a: NoteView, b: NoteView): number =>
  new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [NoteEditorComponent, NoteCardComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css',
})
export class MainDashboardComponent {
  #noteService = inject(NoteService);
  #filterService = inject(NoteFilterService);

  notes = signal<NoteView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editorOpen = signal(false);
  selectedNote = signal<NoteView | null>(null);
  viewMode = signal<ViewMode>('grid');
  openWithImagePicker = signal(false);

  #savedDuringSession = false;

  private readonly sortedNotes = computed(() => [...this.notes()].sort(byNewest));

  readonly filteredNotes = computed(() => {
    const q = this.#filterService.searchQuery().toLowerCase().trim();
    if (!q) return this.sortedNotes();
    return this.sortedNotes().filter(n => {
      const inTitle = n.title.toLowerCase().includes(q);
      const inItems = n.content.items?.some(i => i.text.toLowerCase().includes(q)) ?? false;
      const inBody = n.content.body?.toLowerCase().includes(q) ?? false;
      return inTitle || inItems || inBody;
    });
  });

  readonly isSearching = computed(() => this.#filterService.searchQuery().trim().length > 0);
  readonly searchQuery = computed(() => this.#filterService.searchQuery().trim());

  ngOnInit(): void {
    this.#loadNotes();
  }

  // skeleton
  #loadNotes(): void {
    this.loading.set(true);
    this.error.set(null);
    this.#noteService.getAll().subscribe({
      next: (data) => {
        this.notes.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  // Refresco silencioso sin skeleton
  #refreshNotes(): void {
    this.#noteService.getAll().subscribe({
      next: (data) => this.notes.set(data),
    });
  }

  toggleView(): void {
    this.viewMode.update(v => (v === 'grid' ? 'list' : 'grid'));
  }

  openNewNote(): void {
  this.#savedDuringSession = false;
  this.selectedNote.set(null);
  this.openWithImagePicker.set(false);
  this.editorOpen.set(true);
}

  openNewNoteWithImage(): void {
  this.#savedDuringSession = false;
  this.selectedNote.set(null);
  this.openWithImagePicker.set(true);
  this.editorOpen.set(true);
}

  openNote(note: NoteView): void {
    this.#savedDuringSession = false;
    this.selectedNote.set(note);
    this.editorOpen.set(true);
  }

  onNoteSaved(_savedNote: NoteView): void {
    this.#savedDuringSession = true;
  }

  onEditorClosed(): void {
  this.editorOpen.set(false);
  this.selectedNote.set(null);
  this.openWithImagePicker.set(false);
  if (this.#savedDuringSession) {
    this.#savedDuringSession = false;
    this.#refreshNotes();
  }
}

  deleteNote(id: number): void {
    // Optimistic: quitar de la UI inmediatamente
    this.notes.update(notes => notes.filter(n => n.id !== id));
    this.#noteService.delete(id).subscribe({
      // Re-fetch silencioso para confirmar el estado real del backend
      next: () => this.#refreshNotes(),
      // Si falla, restaurar la lista desde el backend
      error: () => this.#refreshNotes(),
    });
  }
}
