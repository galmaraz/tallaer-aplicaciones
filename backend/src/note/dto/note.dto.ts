import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class NoteDto {
  @IsNumber()
  @IsOptional()
  id?: number;

    @IsNotEmpty()
    @IsString()
    title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsNumber()
  @IsNotEmpty()
  usuario_id!: number;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
