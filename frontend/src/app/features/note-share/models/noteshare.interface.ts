import { NoteShareRole } from "./noteshare-role.enum";

export interface NoteShare {
  id: number;
  role: NoteShareRole;
  note: { id: number; title: string };
  usuario: { id: number; name: string; email: string };
}

export interface NoteSharePayload {
  id?: number;
  role: NoteShareRole;
  note: { id: number };
  usuario: { id: number };
}