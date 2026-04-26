// core/user/models/user.model.ts

/** Usuario tal como viene del backend (siempre tiene id, sin password) */
export interface User {
  id: number;
  name: string;
  email: string;
}

/** Payload para crear o actualizar un usuario */
export interface UserPayload {
  id?: number;       // opcional: si viene, es update; si no, es create
  name: string;
  email: string;
  password?: string; // solo se manda al crear/cambiar contraseña
}