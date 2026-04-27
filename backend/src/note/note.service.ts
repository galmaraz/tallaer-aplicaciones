import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './model/note.model';
import { NoteDto } from './dto/note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly repository: Repository<Note>,
  ) {}

  getAll() {
    return this.repository.find({ where: { deleted: false } });
  }

  getTrash() {
    return this.repository.find({ where: { deleted: true } });
  }

  getById(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  async save(data: NoteDto) {
    if (data.id != undefined && data.id != null && data.id != 0) {
      const note = await this.repository.findOneBy({ id: data.id });
      if (!note) throw new Error(`Entidad con id ${data.id} no encontrado`);
      await this.repository.update({ id: data.id }, data);
      return this.repository.findOne({ where: { id: data.id } });
    } else {
      const entity = this.repository.create(data);
      return this.repository.save(entity);
    }
  }

  async softDelete(id: number) {
    await this.findById(id);
    await this.repository.update({ id }, { deleted: true });
    return this.repository.findOne({ where: { id } });
  }

  async restore(id: number) {
    await this.findById(id);
    await this.repository.update({ id }, { deleted: false });
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const data = await this.findById(id);
    if (!data) throw new Error(`Entidad con id ${id} no encontrado`);
    await this.repository.delete({ id });
    return 'Se elimino correctamente!!!';
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new Error(`Entidad con id ${id} no encontrado`);
    return entity;
  }
}
