import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Note } from "./model/note.model";
import { NoteDto } from "./dto/note.dto";

@Injectable()
export class NoteService {
    constructor(
        @InjectRepository(Note)
        private readonly repository: Repository<Note>
    ) {}

    getAll() {
        return this.repository.find();
    }

    getById(id: number) {
        var data = this.repository.findOne({
            where: { id }
        });
        return data;
    }

    async save(data: NoteDto) {
        if(data.id != undefined && data.id != null && data.id != 0) {
            const usuario = await this.repository.findOneBy({id: data.id});
            if(!usuario) throw new Error(`Entidad con id ${data.id} no encontrado`);

            await this.repository.update({id: data.id}, data);
            return 'Se actualizo correctamente!!!';
        } else {
            const entity = await this.repository.create(data);
            await this.repository.save(entity);
            return 'Se guardo correctamente!!!';
        }
    }

    async delete(id: number) {
        var data = await this.findById(id);
        if (!data) throw new Error(`Entidad con id ${id} no encontrado`);
        await this.repository.delete({id: id});
        return 'Se elimino correctamente!!!';
    }

    async findById(id: number) {
        const entity = await this.repository.findOne({
            where: { id }
        });

        if(!entity) throw new Error(`Entidad con id ${id} no encontrado`);

        return entity;
    }
}