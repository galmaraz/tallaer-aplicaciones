export enum NoteShareRole {
  VIEWER = 1,
  EDITOR = 2,
}

export const ROLE_LABELS: Record<NoteShareRole, string> = {
  [NoteShareRole.VIEWER]: 'Solo lectura',
  [NoteShareRole.EDITOR]: 'Puede editar',
};