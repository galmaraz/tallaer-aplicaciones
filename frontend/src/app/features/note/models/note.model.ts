export interface NoteItem {
  text: string;
  checked: boolean;
}

export interface NoteContent {
  type: 'text' | 'list';
  body?: string;
  items?: NoteItem[];
}

export interface NoteOwner {
  id: number;
  name: string;
  email: string;
}

export interface NoteView {
  id?: number;
  title: string;
  content: NoteContent;
  activo: boolean;
  usuario_id?: number;
  is_shared?: boolean;
  usuario?: NoteOwner;
  created_at?: string;
  updated_at?: string;
}

export interface NoteRaw {
  id?: number;
  title: string;
  content: string;
  activo: boolean;
  usuario_id?: number;
  is_shared?: boolean;
  usuario?: NoteOwner;
  created_at?: string;
  updated_at?: string;
}

export interface EditorSnapshot {
  title: string;
  items: NoteItem[];
}

export function parseNoteView(raw: NoteRaw): NoteView {
  if (typeof raw !== 'object' || raw === null) {
    return { title: '', content: { type: 'list', items: [] }, activo: true };
  }

  let content: NoteContent;
  const rawContent = (raw as { content: unknown }).content;

  if (rawContent && typeof rawContent === 'object') {
    content = rawContent as NoteContent;
  } else {
    try {
      content = JSON.parse(rawContent as string) as NoteContent;
    } catch {
      content = { type: 'text', body: rawContent as string };
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    content,
    activo: raw.activo,
    usuario_id: raw.usuario_id,
    is_shared: raw.is_shared,
    usuario: raw.usuario,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function serializeNote(note: NoteView): NoteRaw {
  return {
    id: note.id,
    title: note.title,
    content: JSON.stringify(note.content),
    activo: note.activo,
    usuario_id: note.usuario_id,
  };
}