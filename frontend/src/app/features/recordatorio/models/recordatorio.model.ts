export interface Recordatorio {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: string;
  completado: boolean;
  estado: boolean;
}

export interface RecordatorioDto {
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: string;
  completado?: boolean;
  estado?: boolean;
}
