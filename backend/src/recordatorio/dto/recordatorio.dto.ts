import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RecordatorioDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaRecordatorio: Date;

  @IsBoolean()
  @IsOptional()
  completado?: boolean;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsNumber()
  @IsNotEmpty()
  noteId: number;
}