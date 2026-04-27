import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { NoteView, serializeNote } from '../../../note/models/note.model';
import { NoteService } from '../../../note/services/note.service';
import { NoteFilterService } from '../../../note/services/note-filter.service';
import { NoteEditorComponent } from '../../../note/components/note-editor/note-editor.component';
import { NoteCardComponent } from '../../../note/components/note-card/note-card.component';
import { CurrentUserService } from '../../../../core/user/services/current.service';
import { ShareDialogComponent } from "../../../note-share/components/share-dialog/share-dialog.component";

type ViewMode = 'grid' | 'list';

const byNewest = (a: NoteView, b: NoteView): number =>
  new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [NoteEditorComponent, NoteCardComponent, ShareDialogComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css',
})
export class MainDashboardComponent implements OnInit {
  #noteService = inject(NoteService);
  #filterService = inject(NoteFilterService);
  #currentUser = inject(CurrentUserService)

  notes = signal<NoteView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editorOpen = signal(false);
  selectedNote = signal<NoteView | null>(null);
  newNoteType = signal<'text' | 'list'>('text');
  viewMode = signal<ViewMode>('grid');
  openWithImagePicker = signal(false);
  sharingNote = signal<NoteView | null>(null);

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

  constructor() {
    effect(() => {
      const userId = this.#currentUser.currentUserId();
      if (userId !== null) {
        this.#loadNotes(userId);
      }
    }, { allowSignalWrites: true });
  }

  #loadNotes(userId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.#noteService.getAll(userId).subscribe({
      next: (data) => { this.notes.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  #refreshNotes(): void {
    const userId = this.#currentUser.currentUserId();
    if (userId === null) return;
    this.#noteService.getAll(userId).subscribe({
      next: (data) => this.notes.set(data),
    });
  }

  toggleView(): void {
    this.viewMode.update(v => (v === 'grid' ? 'list' : 'grid'));
  }

  openNewNote(type: 'text' | 'list' = 'text'): void {
    this.#savedDuringSession = false;
    this.selectedNote.set(null);
    this.newNoteType.set(type);
    this.openWithImagePicker.set(false);
    this.editorOpen.set(true);
  }

  openNote(note: NoteView): void {
    this.selectedNote.set(note);
    this.editorOpen.set(true);
  }

  onNoteSaved(savedNote: NoteView): void {
    if (!savedNote?.id) {
      this.#refreshNotes();
      return;
    }
    this.notes.update(current => {
      const idx = current.findIndex(n => n.id === savedNote.id);
      if (idx >= 0) {
        const copy = [...current];
        copy[idx] = savedNote;
        return copy;
      }
      return [savedNote, ...current];
    });
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

  softDeleteNote(id: number): void {
    this.notes.update(notes => notes.filter(n => n.id !== id));
    this.#noteService.softDelete(id).subscribe({
      error: () => this.#refreshNotes(),
    });
  }

  onEditorSoftDelete(id: number): void {
    this.editorOpen.set(false);
    this.selectedNote.set(null);
    this.softDeleteNote(id);
  }

  duplicateNote(note: NoteView): void {
    const copy: NoteView = {
      title: `Copia de ${note.title}`,
      content: {
        type: note.content.type,
        body: note.content.body,
        items: note.content.items?.map(i => ({ ...i })),
      },
      activo: true,
    };
    this.#noteService.save(serializeNote(copy)).subscribe({
      next: (saved) => this.notes.update(current => [saved, ...current]),
      error: () => this.#refreshNotes(),
    });
  }

  onShareNote(note: NoteView): void {
    this.sharingNote.set(note);
  }

  onShareDialogClosed(): void {
    this.sharingNote.set(null);
    this.#refreshNotes();
  }

  onEditorDuplicate(note: NoteView): void {
    this.editorOpen.set(false);
    this.selectedNote.set(null);
    this.duplicateNote(note);
  }
}
