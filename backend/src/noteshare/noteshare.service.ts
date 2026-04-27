import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Noteshare } from "./model/noteshare.model";
import { NoteshareDto } from "./dto/noteshare.dto";

@Injectable()
export class NoteShareService {
    constructor(
        @InjectRepository(Noteshare)
        private readonly repository: Repository<Noteshare>
    ) {}

    private readonly baseSelect = {
        id: true,
        role: true,
        note: { id: true, title: true },
        usuario: { id: true, name: true, email: true },
    } as const;

    async getAll() {
        return await this.repository.find({
            relations: { note: true, usuario: true },
            select: this.baseSelect,
        });
    }

    async getById(id: number) { return await this.findById(id); }

    async getByUser(userId: number) {
        return await this.repository.find({
            where: { usuario: { id: userId } },
            relations: { note: true, usuario: true },
            select: this.baseSelect,
        });
    }

    async getByNote(noteId: number) {
        return await this.repository.find({
            where: { note: { id: noteId } },
            relations: { note: true, usuario: true },
            select: this.baseSelect,
        });
    }

    async save(data: NoteshareDto) {
        if (data.id != undefined && data.id != null && data.id != 0) {
            const existing = await this.repository.findOneBy({ id: data.id });
            if (!existing) throw new Error(`Share con id ${data.id} no encontrado`);
            await this.repository.update({ id: data.id }, data);
            return 'Se actualizo correctamente!!!';
        } else {
            // 👇 Verificar si ya existe un share con la misma nota + usuario
            const duplicate = await this.repository.findOne({
                where: {
                    note: { id: data.note.id },
                    usuario: { id: data.usuario.id },
                },
            });

            if (duplicate) {
                // Ya existe, solo actualizamos el rol
                await this.repository.update({ id: duplicate.id }, { role: data.role });
                return 'Ya estaba compartida, se actualizo el rol';
            }

            const entity = this.repository.create(data);
            await this.repository.save(entity);
            return 'Se guardo correctamente!!!';
        }
    }

    async delete(id: number) {
        const exists = await this.repository.findOneBy({ id });
        if (!exists) throw new Error(`Entidad con id ${id} no encontrado`);
        await this.repository.delete({ id });
        return 'Se elimino correctamente!!!';
    }

    async findById(id: number) {
        return await this.repository.findOne({
            where: { id },
            relations: { note: true, usuario: true },
            select: this.baseSelect,
        });
    }
}