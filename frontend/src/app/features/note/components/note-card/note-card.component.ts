import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoteItem, NoteView } from '../../models/note.model';
import { AttachmentService } from '../../services/attachment.service';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './note-card.component.html',
})
export class NoteCardComponent implements OnInit {
  note = input.required<NoteView>();
  editNote = output<NoteView>();
  softDeleteNote = output<number>();
  duplicateNote = output<NoteView>();

  #attachmentService = inject(AttachmentService);
  #destroyRef = inject(DestroyRef);

  coverImageUrl = signal<string | null>(null);
  menuOpen = signal(false);

  private readonly PREVIEW_LIMIT = 3;

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
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      return;
    }
    this.editNote.emit(this.note());
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  onSoftDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    const id = this.note().id;
    if (id !== undefined) this.softDeleteNote.emit(id);
  }

  onDuplicate(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.duplicateNote.emit(this.note());
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }
}
