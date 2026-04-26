import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recordatorio } from './model/recordatorio.model';
import { Repository } from 'typeorm';
import { RecordatorioDto } from './dto/recordatorio.dto';

@Injectable()
export class RecordatorioService {
  constructor(
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,
  ) {}

  async listarTodos() {
    return await this.recordatorioRepository.find({
      order: {
        fechaRecordatorio: 'ASC',
      },
    });
  }

  async buscarPorId(id: number) {
    const recordatorio = await this.recordatorioRepository.findOne({
      where: { id },
    });

    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    return recordatorio;
  }

  async crear(recordatorioDto: RecordatorioDto) {
    const recordatorio = this.recordatorioRepository.create(recordatorioDto);
    return await this.recordatorioRepository.save(recordatorio);
  }

  async actualizar(id: number, recordatorioDto: RecordatorioDto) {
    const recordatorio = await this.buscarPorId(id);

    Object.assign(recordatorio, recordatorioDto);

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
      order: {
        fechaRecordatorio: 'ASC',
      },
    });
  }
}