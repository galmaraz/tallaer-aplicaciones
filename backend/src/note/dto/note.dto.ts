import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class NoteDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  activo: boolean;

  @IsNumber()
  @IsNotEmpty()
  usuario_id: number;
}