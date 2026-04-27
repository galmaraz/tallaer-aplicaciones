import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class NoteDto {

    @IsOptional()
    id?: number;

    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    content!: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @IsOptional()
    @IsBoolean()
    deleted?: boolean;
}
