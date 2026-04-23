import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EditorSnapshot,
  NoteContent,
  NoteItem,
  NoteView,
  serializeNote,
} from '../../models/note.model';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [],
  templateUrl: './note-editor.component.html',
})
export class NoteEditorComponent implements OnInit {
  note = input<NoteView | null>(null);
  saved = output<NoteView>();
  closed = output<void>();

  #noteService = inject(NoteService);
  #destroyRef = inject(DestroyRef);

  title = signal('');
  items = signal<NoteItem[]>([]);
  saving = signal(false);

  #history = signal<EditorSnapshot[]>([]);
  #future = signal<EditorSnapshot[]>([]);

  canUndo = computed(() => this.#history().length > 0);
  canRedo = computed(() => this.#future().length > 0);

  ngOnInit(): void {
    const note = this.note();
    if (note) {
      this.title.set(note.title);
      if (note.content.type === 'list') {
        this.items.set(note.content.items?.map(i => ({ ...i })) ?? []);
      }
    }
  }

  #snapshot(): EditorSnapshot {
    return { title: this.title(), items: this.items().map(i => ({ ...i })) };
  }

  #saveToHistory(): void {
    this.#history.update(h => [...h, this.#snapshot()]);
    this.#future.set([]);
  }

  #saveToHistoryIfChanged(): void {
    const snap = this.#snapshot();
    const last = this.#history().at(-1);
    if (!last || JSON.stringify(last) !== JSON.stringify(snap)) {
      this.#history.update(h => [...h, snap]);
      this.#future.set([]);
    }
  }

  onTitleChange(value: string): void {
    this.title.set(value);
  }

  onTitleBlur(): void {
    this.#saveToHistoryIfChanged();
  }

  addItem(): void {
    this.#saveToHistoryIfChanged();
    this.items.update(items => [...items, { text: '', checked: false }]);
  }

  removeItem(index: number): void {
    this.#saveToHistory();
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  toggleItem(index: number): void {
    this.#saveToHistory();
    this.items.update(items =>
      items.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  }

  updateItemText(index: number, text: string): void {
    this.items.update(items =>
      items.map((item, i) => (i === index ? { ...item, text } : item))
    );
  }

  onItemBlur(): void {
    this.#saveToHistoryIfChanged();
  }

  undo(): void {
    if (this.#history().length === 0) return;
    const current = this.#snapshot();
    const prev = this.#history().at(-1)!;
    this.#future.update(f => [current, ...f]);
    this.#history.update(h => h.slice(0, -1));
    this.title.set(prev.title);
    this.items.set(prev.items.map(i => ({ ...i })));
  }

  redo(): void {
    if (this.#future().length === 0) return;
    const current = this.#snapshot();
    const next = this.#future()[0];
    this.#history.update(h => [...h, current]);
    this.#future.update(f => f.slice(1));
    this.title.set(next.title);
    this.items.set(next.items.map(i => ({ ...i })));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.key === 'z' && event.shiftKey))
    ) {
      event.preventDefault();
      this.redo();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).dataset['backdrop'] === 'true') {
      this.close();
    }
  }

  close(): void {
    if (this.saving()) return;

    const title = this.title().trim();
    const items = this.items().filter(i => i.text.trim());

    if (!title && items.length === 0) {
      this.closed.emit();
      return;
    }

    const content: NoteContent = { type: 'list', items };
    const noteView: NoteView = {
      id: this.note()?.id,
      title: title || 'Sin título',
      content,
      activo: true,
    };

    this.saving.set(true);

    this.#noteService
      .save(serializeNote(noteView))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (savedNote) => {
          this.saved.emit(savedNote);
          this.closed.emit();
        },
        error: () => {
          this.saving.set(false);
          this.closed.emit();
        },
      });
  }
}
