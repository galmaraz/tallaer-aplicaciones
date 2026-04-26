export interface AttachmentRaw {
  id: number;
  filename: string;
  filetype: string;
  filesize: number | null;
  filedata?: unknown;
  note?: { id: number } | number | null;
}

export interface AttachmentView {
  id: number;
  filename: string;
  filetype: string;
  filesize: number | null;
  noteId: number | null;
}

export function parseAttachmentView(raw: AttachmentRaw): AttachmentView {
  const noteId =
    typeof raw.note === 'number'
      ? raw.note
      : raw.note && typeof raw.note === 'object'
        ? raw.note.id
        : null;

  return {
    id: raw.id,
    filename: raw.filename,
    filetype: raw.filetype,
    filesize: raw.filesize ?? null,
    noteId,
  };
}
