import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoteItem, NoteView } from '../../models/note.model';
import { AttachmentService } from '../../services/attachment.service';
import { NoteShareService } from '../../../note-share/services/noteshare.service';
import { NoteShare } from '../../../note-share/models/noteshare.interface';
import { NoteShareRole } from '../../../note-share/models/noteshare-role.enum';
import { CurrentUserService } from '../../../../core/user/services/current.service';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './note-card.component.html',
})
export class NoteCardComponent implements OnInit {
  note = input.required<NoteView>();
  editNote = output<NoteView>();
  deleteNote = output<number>();
  shareNote = output<NoteView>();

  #attachmentService = inject(AttachmentService);
  #shareService = inject(NoteShareService);
  #currentUser = inject(CurrentUserService);
  #destroyRef = inject(DestroyRef);

  coverImageUrl = signal<string | null>(null);
  collaborators = signal<NoteShare[]>([]);

  private readonly PREVIEW_LIMIT = 3;

  noteId = computed<number | null>(() => this.note().id ?? null);

  /** Soy el dueño de la nota */
  isOwner = computed<boolean>(() => {
    const note = this.note();
    const currentId = this.#currentUser.currentUserId();
    return note.usuario_id === currentId;
  });

  /** Soy VIEWER en una nota compartida */
  isReadOnly = computed<boolean>(() => {
    if (this.isOwner()) return false;
    const currentId = this.#currentUser.currentUserId();
    const myShare = this.collaborators().find(c => c.usuario.id === currentId);
    if (!myShare) return true;
    return myShare.role === NoteShareRole.VIEWER;
  });

  ngOnInit(): void {
    const noteId = this.note().id;
    if (!noteId) return;

    this.#attachmentService
      .getByNoteId(noteId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (attachments) => {
          const first = attachments.find(a => a.imageUrl);
          this.coverImageUrl.set(first?.imageUrl ?? null);
        },
        error: () => {},
      });

    this.#shareService
      .getByNote(noteId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (shares) => this.collaborators.set(shares),
        error: () => this.collaborators.set([]),
      });
  }

  get previewItems(): NoteItem[] {
    return this.note().content.items?.slice(0, this.PREVIEW_LIMIT) ?? [];
  }

  get remainingCount(): number {
    return Math.max(0, (this.note().content.items?.length ?? 0) - this.PREVIEW_LIMIT);
  }

  get checkedCount(): number {
    return this.note().content.items?.filter(i => i.checked).length ?? 0;
  }

  get totalCount(): number {
    return this.note().content.items?.length ?? 0;
  }

  onEdit(): void {
    this.editNote.emit(this.note());
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.note().id;
    if (id !== undefined) this.deleteNote.emit(id);
  }

  onShare(event: MouseEvent): void {
    event.stopPropagation();
    this.shareNote.emit(this.note());
  }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
  }
}