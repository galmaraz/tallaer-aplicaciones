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

  toggleView(): void {
    this.viewMode.update(v => (v === 'grid' ? 'list' : 'grid'));
  }

  openNewNote(): void {
    this.selectedNote.set(null);
    this.editorOpen.set(true);
  }

  openNote(note: NoteView): void {
    this.selectedNote.set(note);
    this.editorOpen.set(true);
  }

  onNoteSaved(savedNote: NoteView): void {
    this.notes.update(notes => {
      const index = notes.findIndex(n => n.id === savedNote.id);
      if (index >= 0) {
        return notes.map(n => (n.id === savedNote.id ? savedNote : n));
      }
      return [savedNote, ...notes];
    });
  }

  onEditorClosed(): void {
    this.editorOpen.set(false);
    this.selectedNote.set(null);
  }

  deleteNote(id: number): void {
    this.#noteService.delete(id).subscribe({
      next: () => this.notes.update(notes => notes.filter(n => n.id !== id)),
    });
  }
}
