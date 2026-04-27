import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './model/note.model';
import { NoteDto } from './dto/note.dto';
import { Noteshare } from 'src/noteshare/model/noteshare.model';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly repository: Repository<Note>,
    @InjectRepository(Noteshare)
    private readonly shareRepository: Repository<Noteshare>,
  ) {}

  async getAllForUser(userId: number) {
    const ownNotes = await this.repository.find({
      where: { usuario_id: userId, activo: true, deleted: false },
      relations: { usuario: true },
      order: { updated_at: 'DESC' },
    });

    const sharedRecords = await this.shareRepository.find({
      where: { usuario: { id: userId } },
      relations: { note: { usuario: true } },
    });

    const sharedNotes = sharedRecords
      .map(s => s.note)
      .filter(n => n && n.activo);

    const result = [
      ...ownNotes.map(n => ({ ...n, is_shared: false })),
      ...sharedNotes.map(n => ({ ...n, is_shared: true })),
    ];

    return result.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }

  async getById(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: { usuario: true },
    });
  }

  async save(data: NoteDto) {
    if (data.id != undefined && data.id != null && data.id != 0) {
      const note = await this.repository.findOneBy({ id: data.id });
      if (!note) throw new Error(`Nota con id ${data.id} no encontrada`);
      await this.repository.update({ id: data.id }, data);
      return await this.repository.findOne({
        where: { id: data.id },
        relations: { usuario: true },
      });
    } else {
      const entity = this.repository.create(data);
      const saved = await this.repository.save(entity);
      return await this.repository.findOne({
        where: { id: saved.id },
        relations: { usuario: true },
      });
    }
  }

  async delete(id: number) {
    const note = await this.repository.findOneBy({ id });
    if (!note) throw new Error(`Nota con id ${id} no encontrada`);
    await this.repository.delete({ id });
    return 'Se elimino correctamente!!!';
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) throw new Error(`Entidad con id ${id} no encontrado`);

    return entity;
  }
  getTrash() {
    return this.repository.find({ where: { deleted: true } });
  }
}
