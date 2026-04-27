import { NoteView } from '../../note/models/note.model';

export interface Recordatorio {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: string;
  completado: boolean;
  estado: boolean;
  note?: NoteView;
}

export interface RecordatorioDto {
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: string;
  completado?: boolean;
  estado?: boolean;
  noteId: number;
}
