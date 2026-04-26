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
  imageUrl: string | null;
}

function filedataToBase64(filedata: unknown, filetype: string): string | null {
  if (!filedata) return null;

  // PostgreSQL bytea via TypeORM puede llegar como { type:'Buffer', data:number[] }
  // o directamente como number[], o ya como string base64
  let bytes: number[] | null = null;

  if (typeof filedata === 'string') {
    return `data:${filetype};base64,${filedata}`;
  }

  if (Array.isArray(filedata)) {
    bytes = filedata as number[];
  } else if (
    typeof filedata === 'object' &&
    filedata !== null &&
    'data' in filedata &&
    Array.isArray((filedata as { data: unknown }).data)
  ) {
    bytes = (filedata as { data: number[] }).data;
  }

  if (!bytes || bytes.length === 0) return null;

  // Convertir array de bytes a base64
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return `data:${filetype};base64,${btoa(binary)}`;
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
    imageUrl: filedataToBase64(raw.filedata, raw.filetype),
  };
}