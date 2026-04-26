import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recordatorio } from './model/recordatorio.model';
import { Repository } from 'typeorm';
import { RecordatorioDto } from './dto/recordatorio.dto';
import { Note } from '../note/model/note.model';

@Injectable()
export class RecordatorioService {
  constructor(
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,

    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async listarTodos() {
    return await this.recordatorioRepository.find({
      relations: ['note'],
      order: {
        fechaRecordatorio: 'ASC',
      },
    });
  }

  async listarPorNota(noteId: number) {
    return await this.recordatorioRepository.find({
      where: {
        note: {
          id: noteId,
        },
      },
      relations: ['note'],
      order: {
        fechaRecordatorio: 'ASC',
      },
    });
  }

  async buscarPorId(id: number) {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id },
      relations: ['note'],
    });

    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    return recordatorio;
  }

  async crear(recordatorioDto: RecordatorioDto) {
    const note = await this.noteRepository.findOne({
      where: { id: recordatorioDto.noteId },
    });

    if (!note) {
      throw new NotFoundException('Nota no encontrada');
    }

    const recordatorio = this.recordatorioRepository.create({
      titulo: recordatorioDto.titulo,
      descripcion: recordatorioDto.descripcion,
      fechaRecordatorio: recordatorioDto.fechaRecordatorio,
      completado: recordatorioDto.completado ?? false,
      estado: recordatorioDto.estado ?? true,
      note,
    });

    return await this.recordatorioRepository.save(recordatorio);
  }

  async actualizar(id: number, recordatorioDto: RecordatorioDto) {
    const recordatorio = await this.buscarPorId(id);

    if (recordatorioDto.noteId) {
      const note = await this.noteRepository.findOne({
        where: { id: recordatorioDto.noteId },
      });

      if (!note) {
        throw new NotFoundException('Nota no encontrada');
      }

      recordatorio.note = note;
    }

    recordatorio.titulo = recordatorioDto.titulo;
    recordatorio.descripcion = recordatorioDto.descripcion ?? '';
    recordatorio.fechaRecordatorio = recordatorioDto.fechaRecordatorio;
    recordatorio.completado = recordatorioDto.completado ?? recordatorio.completado;
    recordatorio.estado = recordatorioDto.estado ?? recordatorio.estado;

    return await this.recordatorioRepository.save(recordatorio);
  }

  async eliminar(id: number) {
    const recordatorio = await this.buscarPorId(id);

    await this.recordatorioRepository.remove(recordatorio);

    return {
      mensaje: 'Recordatorio eliminado correctamente',
    };
  }

  async completar(id: number) {
    const recordatorio = await this.buscarPorId(id);

    recordatorio.completado = true;

    return await this.recordatorioRepository.save(recordatorio);
  }

  async pendientes() {
    return await this.recordatorioRepository.find({
      where: {
        completado: false,
        estado: true,
      },
      relations: ['note'],
      order: {
        fechaRecordatorio: 'ASC',
      },
    });
  }
}