import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NoteItem, NoteView } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './note-card.component.html',
})
export class NoteCardComponent {
  note = input.required<NoteView>();
  editNote = output<NoteView>();
  deleteNote = output<number>();

  private readonly PREVIEW_LIMIT = 5;

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
}
