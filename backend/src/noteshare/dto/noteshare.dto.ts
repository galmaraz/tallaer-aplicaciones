import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { NoteDto } from "src/note/dto/note.dto";
import { UsuarioDto } from "src/usuario/dto/usuario.dto";
import { NoteShareRole } from "../model/noteshare-role.enum";

export class NoteshareDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsEnum(NoteShareRole)
    @IsNotEmpty()
    role: NoteShareRole;

    @IsNotEmpty()
    note: NoteDto;

    @IsNotEmpty()
    usuario: UsuarioDto;
}