import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from './model/attachment.model';
import { Note } from 'src/note/model/note.model';

type UploadedAttachmentFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly repository: Repository<Attachment>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async getAll() {
    return await this.repository.find({
      relations: { note: true },
    });
  }

  async getById(id: number) {
    return await this.findById(id);
  }

  async save(data: UploadedAttachmentFile, entityId: number) {
    if (!data) throw new BadRequestException('No se recibio ningun archivo');

    if (!entityId)
      throw new BadRequestException('Debe enviar el id de la nota asociada');

    if (!data.buffer || data.buffer.length === 0)
      throw new BadRequestException(
        'El archivo no contiene buffer. Verifica memoryStorage en el interceptor',
      );

    const validImageTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!validImageTypes.includes(data.mimetype.toLowerCase()))
      throw new BadRequestException(
        'Solo se permiten archivos de imagen (png, jpg, jpeg, webp)',
      );

    const note = await this.noteRepository.findOne({ where: { id: entityId } });
    if (!note)
      throw new NotFoundException(`No existe una nota con id ${entityId}`);

    const attachment = new Attachment();
    attachment.filename = data.originalname;
    attachment.filetype = data.mimetype;
    attachment.filesize = data.size;
    attachment.filedata = data.buffer;
    attachment.note = note;
    return await this.repository.save(attachment);
  }

  async delete(id: number) {
    const attachment = await this.findById(id);
    await this.repository.delete({ id });
    return {
      message: 'Attachment eliminado correctamente',
      id: attachment.id,
    };
  }

  private async findById(id: number) {
    const attachment = await this.repository.findOne({
      where: { id },
      relations: { note: true },
    });

    if (!attachment)
      throw new NotFoundException(`Attachment con id ${id} no encontrado`);

    return attachment;
  }
}
