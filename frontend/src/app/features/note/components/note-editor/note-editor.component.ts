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
import { NoteShareService } from '../../../note-share/services/noteshare.service';
import { ShareDialogComponent } from '../../../note-share/components/share-dialog/share-dialog.component';
import { NoteShare } from '../../../note-share/models/noteshare.interface';
import { CurrentUserService } from '../../../../core/user/services/current.service';
import { NoteShareRole } from '../../../note-share/models/noteshare-role.enum';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [ShareDialogComponent],
  templateUrl: './note-editor.component.html',
})
export class NoteEditorComponent implements OnInit {
  note = input<NoteView | null>(null);
  initialType = input<'text' | 'list'>('list');
  saved = output<NoteView>();
  closed = output<void>();
  softDeleteRequested = output<number>();
  duplicateRequested = output<NoteView>();
  autoOpenImagePicker = input(false);

  @ViewChild('attachmentInput')
  attachmentInput?: ElementRef<HTMLInputElement>;

  #noteService = inject(NoteService);
  #attachmentService = inject(AttachmentService);
  #noteShareService = inject(NoteShareService);
  #currentUser = inject(CurrentUserService);
  #destroyRef = inject(DestroyRef);

  title = signal('');
  noteType = signal<'text' | 'list'>('list');
  textBody = signal('');
  items = signal<NoteItem[]>([]);
  saving = signal(false);
  uploadingAttachment = signal(false);
  attachmentFeedback = signal<string | null>(null);
  attachmentFeedbackIsError = signal(false);
  moreMenuOpen = signal(false);

  shareDialogOpen = signal(false);
  collaborators = signal<NoteShare[]>([]);

  attachments = signal<AttachmentView[]>([]);
  loadingAttachments = signal(false);
  deletingAttachmentId = signal<number | null>(null);
  expandedImageUrl = signal<string | null>(null);

  draggedIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  #history = signal<EditorSnapshot[]>([]);
  #future = signal<EditorSnapshot[]>([]);

  canUndo = computed(() => this.#history().length > 0);
  canRedo = computed(() => this.#future().length > 0);
  noteId = computed<number | null>(() => this.note()?.id ?? null);

  isReadOnly = computed<boolean>(() => {
    const note = this.note();
    if (!note) return false;

    const currentId = this.#currentUser.currentUserId();
    if (note.usuario_id === currentId) return false;
    const myShare = this.collaborators().find(c => c.usuario.id === currentId);
    if (!myShare) return true;
    return myShare.role === NoteShareRole.VIEWER;
  });

  ngOnInit(): void {
    const note = this.note();
    if (note) {
      this.title.set(note.title);
      if (note.content.type === 'list') {
        this.noteType.set('list');
        this.items.set(note.content.items?.map(i => ({ ...i })) ?? []);
      } else {
        this.noteType.set('text');
        this.textBody.set(note.content.body ?? '');
      }
      if (note.id) {
        this.#loadAttachments(note.id);
        this.#loadCollaborators(note.id);
      }
    }  else {
      this.noteType.set(this.initialType());
    if (this.autoOpenImagePicker()) {
      setTimeout(() => this.openAttachmentPicker(), 150);
    }
    if (this.autoOpenImagePicker()) {
      setTimeout(() => this.openAttachmentPicker(), 150);
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

  #loadCollaborators(noteId: number): void {
    this.#noteShareService
      .getByNote(noteId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (shares) => this.collaborators.set(shares),
        error: () => this.collaborators.set([]),
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

  openExpandedImage(url: string): void { this.expandedImageUrl.set(url); }
  closeExpandedImage(): void { this.expandedImageUrl.set(null); }

  #snapshot(): EditorSnapshot {
    return {
      title: this.title(),
      noteType: this.noteType(),
      items: this.items().map(i => ({ ...i })),
      textBody: this.textBody(),
    };
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

  setNoteType(type: 'text' | 'list'): void {
    if (this.noteType() === type) return;
    this.#saveToHistory();
    this.noteType.set(type);
  }

  onTitleChange(value: string): void { this.title.set(value); }
  onTitleBlur(): void { this.#saveToHistoryIfChanged(); }

  onTextBodyChange(value: string): void { this.textBody.set(value); }
  onTextBodyBlur(): void { this.#saveToHistoryIfChanged(); }

  openShareDialog(): void {
    if (!this.noteId()) return;
    this.shareDialogOpen.set(true);
  }

  closeShareDialog(): void {
    this.shareDialogOpen.set(false);
  }

  onCollaboratorsChanged(updated: NoteShare[]): void {
    this.collaborators.set(updated);
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

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOverIndex.set(index);
  }

  onDragLeave(): void { this.dragOverIndex.set(null); }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const sourceIndex = this.draggedIndex();
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    this.#saveToHistory();
    this.items.update(arr => {
      const copy = [...arr];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  toggleMoreMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moreMenuOpen.update(v => !v);
  }

  requestSoftDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.moreMenuOpen.set(false);
    const id = this.note()?.id;
    if (id !== undefined) {
      this.softDeleteRequested.emit(id);
      this.closed.emit();
    }
  }

  requestDuplicate(event: MouseEvent): void {
    event.stopPropagation();
    this.moreMenuOpen.set(false);
    const currentNote = this.note();
    if (!currentNote) return;

    let content: NoteContent;
    if (this.noteType() === 'text') {
      content = { type: 'text', body: this.textBody().trim() };
    } else {
      content = { type: 'list', items: this.items().filter(i => i.text.trim()) };
    }

    const snapshot: NoteView = {
      title: this.title().trim() || 'Sin título',
      content,
      activo: true,
    };
    this.duplicateRequested.emit(snapshot);
    this.closed.emit();
  }

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
    if (noteId) {
      this.#uploadAttachment(file, noteId);
      return;
    }

    // Si no tiene ID, guardar la nota primero y luego subir
    const title = this.title().trim();
    const items = this.items().filter(i => i.text.trim());
    const content: NoteContent = { type: 'list', items };
    const ownerId = this.#currentUser.currentUserId();
    const noteView: NoteView = {
      title: title || 'Sin título',
      content,
      activo: true,
      usuario_id: ownerId ?? undefined,
    };

    this.saving.set(true);
    this.#noteService
      .save(serializeNote(noteView))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (savedNote) => {
          this.saving.set(false);
          this.saved.emit(savedNote);
          if (savedNote.id) {
            this.#uploadAttachment(file, savedNote.id);
          }
        },
        error: () => {
          this.saving.set(false);
          this.#setAttachmentFeedback('No se pudo guardar la nota.', true);
          this.#resetAttachmentInput();
        },
      });
  }

  #uploadAttachment(file: File, noteId: number): void {
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
    this.noteType.set(prev.noteType);
    this.items.set(prev.items.map(i => ({ ...i })));
    this.textBody.set(prev.textBody);
  }

  redo(): void {
    if (!this.#future().length) return;
    const current = this.#snapshot();
    const next = this.#future()[0];
    this.#history.update(h => [...h, current]);
    this.#future.update(f => f.slice(1));
    this.title.set(next.title);
    this.noteType.set(next.noteType);
    this.items.set(next.items.map(i => ({ ...i })));
    this.textBody.set(next.textBody);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.expandedImageUrl()) {
      this.closeExpandedImage();
      return;
    }
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault();
      this.redo();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.moreMenuOpen()) this.moreMenuOpen.set(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).dataset['backdrop'] === 'true') this.close();
  }

  close(): void {
    if (this.isReadOnly()) {
      this.closed.emit();
      return;
    }
    if (this.saving()) return;
    const title = this.title().trim();

    let content: NoteContent;
    let isEmpty: boolean;

    if (this.noteType() === 'text') {
      const body = this.textBody().trim();
      isEmpty = !title && !body;
      content = { type: 'text', body };
    } else {
      const items = this.items().filter(i => i.text.trim());
      isEmpty = !title && items.length === 0;
      content = { type: 'list', items };
    }

    if (isEmpty) {
      this.closed.emit();
      return;
    }

    const content: NoteContent = { type: 'list', items };
    const ownerId = this.note()?.usuario_id ?? this.#currentUser.currentUserId();

    const noteView: NoteView = {
      id: this.note()?.id,
      title: title || 'Sin título',
      content,
      activo: true,
      usuario_id: ownerId ?? undefined,
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

  getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
  }
}
