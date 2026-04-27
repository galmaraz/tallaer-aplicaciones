import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
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
import { AttachmentService } from '../../services/attachment.service';
import { AttachmentView } from '../../models/attachment.model';
import { NoteShareService } from '../../services/note-share.service';
import { UserSelectorComponent } from '../usuario-selector/user-selector.component';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [UserSelectorComponent],
  templateUrl: './note-editor.component.html',
})
export class NoteEditorComponent implements OnInit {
  note = input<NoteView | null>(null);
  saved = output<NoteView>();
  closed = output<void>();
  addReminder = output<NoteView>();

  @ViewChild('attachmentInput')
  attachmentInput?: ElementRef<HTMLInputElement>;

  #noteService = inject(NoteService);
  #attachmentService = inject(AttachmentService);
  #destroyRef = inject(DestroyRef);

  #noteShareService = inject(NoteShareService);
  showShareModal = signal(false);
  sharing = signal(false);

  title = signal('');
  items = signal<NoteItem[]>([]);
  saving = signal(false);
  uploadingAttachment = signal(false);
  attachmentFeedback = signal<string | null>(null);
  attachmentFeedbackIsError = signal(false);

  attachments = signal<AttachmentView[]>([]);
  loadingAttachments = signal(false);
  deletingAttachmentId = signal<number | null>(null);
  expandedImageUrl = signal<string | null>(null); // para ver imagen en grande
  showToast = signal(false);
  

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
      if (note.id) {
        this.#loadAttachments(note.id);
      }
    }
  }

  #loadAttachments(noteId: number): void {
    this.loadingAttachments.set(true);
    this.#attachmentService
      .getByNoteId(noteId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (items) => {
          this.attachments.set(items);
          this.loadingAttachments.set(false);
        },
        error: () => this.loadingAttachments.set(false),
      });
  }

  deleteAttachment(id: number): void {
    this.deletingAttachmentId.set(id);
    this.#attachmentService
      .delete(id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.attachments.update(list => list.filter(a => a.id !== id));
          this.deletingAttachmentId.set(null);
        },
        error: () => this.deletingAttachmentId.set(null),
      });
  }

  openExpandedImage(url: string): void {
    this.expandedImageUrl.set(url);
  }

  closeExpandedImage(): void {
    this.expandedImageUrl.set(null);
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

  onTitleChange(value: string): void { this.title.set(value); }
  onTitleBlur(): void { this.#saveToHistoryIfChanged(); }
  


  onReminderIconClick(): void {
    const notaActual = this.note();

    if (!notaActual?.id || this.saving()) return;

    this.addReminder.emit(notaActual);
  }

  onShareIconClick() {
    this.showShareModal.set(true);
  }


  confirmarCompartir(idUsuarioDestino: number) {
  const notaActual = this.note();
  
  if (notaActual?.id) {
    this.sharing.set(true);
    this.#noteShareService.compartir(notaActual.id, idUsuarioDestino).subscribe({
      next: () => {
        this.sharing.set(false);
        this.showShareModal.set(false); 
        this.showToast.set(true); 
      
        setTimeout(() => this.showToast.set(false), 3000);
      },
      error: () => {
        this.sharing.set(false);
      }
    });
  }
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
      items.map((item, i) => i === index ? { ...item, checked: !item.checked } : item)
    );
  }

  updateItemText(index: number, text: string): void {
    this.items.update(items =>
      items.map((item, i) => (i === index ? { ...item, text } : item))
    );
  }

  onItemBlur(): void { this.#saveToHistoryIfChanged(); }

  openAttachmentPicker(): void {
    this.attachmentInput?.nativeElement.click();
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.attachmentFeedback.set(null);
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.#setAttachmentFeedback('Solo se permiten imágenes png, jpg, jpeg o webp.', true);
      this.#resetAttachmentInput();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.#setAttachmentFeedback('La imagen supera el límite de 5MB.', true);
      this.#resetAttachmentInput();
      return;
    }

    const noteId = this.note()?.id;
    if (!noteId) {
      this.#setAttachmentFeedback('Guarda la nota primero para poder subir imágenes.', true);
      this.#resetAttachmentInput();
      return;
    }

    this.uploadingAttachment.set(true);
    this.#attachmentService
      .save(file, noteId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.uploadingAttachment.set(false);
          this.#setAttachmentFeedback('Imagen subida correctamente.', false);
          this.#resetAttachmentInput();
          this.#loadAttachments(noteId);
          setTimeout(() => this.attachmentFeedback.set(null), 3000);
        },
        error: () => {
          this.uploadingAttachment.set(false);
          this.#setAttachmentFeedback('No se pudo subir la imagen.', true);
          this.#resetAttachmentInput();
        },
      });
  }

  #setAttachmentFeedback(message: string, isError: boolean): void {
    this.attachmentFeedback.set(message);
    this.attachmentFeedbackIsError.set(isError);
  }

  #resetAttachmentInput(): void {
    if (this.attachmentInput?.nativeElement)
      this.attachmentInput.nativeElement.value = '';
  }

  undo(): void {
    if (!this.#history().length) return;
    const current = this.#snapshot();
    const prev = this.#history().at(-1)!;
    this.#future.update(f => [current, ...f]);
    this.#history.update(h => h.slice(0, -1));
    this.title.set(prev.title);
    this.items.set(prev.items.map(i => ({ ...i })));
  }

  redo(): void {
    if (!this.#future().length) return;
    const current = this.#snapshot();
    const next = this.#future()[0];
    this.#history.update(h => [...h, current]);
    this.#future.update(f => f.slice(1));
    this.title.set(next.title);
    this.items.set(next.items.map(i => ({ ...i })));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Cerrar imagen expandida con Escape
    if (event.key === 'Escape' && this.expandedImageUrl()) {
      this.closeExpandedImage();
      return;
    }
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault(); this.undo();
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault(); this.redo();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).dataset['backdrop'] === 'true') this.close();
  }

  close(): void {
    if (this.saving()) return;
    const title = this.title().trim();
    const items = this.items().filter(i => i.text.trim());

    if (!title && items.length === 0) { this.closed.emit(); return; }

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
        next: (savedNote) => { this.saved.emit(savedNote); this.closed.emit(); },
        error: () => { this.saving.set(false); this.closed.emit(); },
      });
  }
}