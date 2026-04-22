import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attachment } from "./model/attachment.model";
import { Note } from "src/note/model/note.model";

@Injectable()
export class AttachmentService {
    constructor(
        @InjectRepository(Attachment)
        private readonly repository: Repository<Attachment>
    ) {}

    getAll() {
        return this.repository.find();
    }

    async save(data: Express.Multer.File, entityId: number) {
        if (!data)
            throw new BadRequestException('No se recibio ningun archivo');

        if (!data.buffer || data.buffer.length === 0)
            throw new BadRequestException('El archivo no contiene buffer. Verifica memoryStorage en el interceptor');

        // implemtar
        var attachment = new Attachment();
        attachment.filename = data.originalname;
        attachment.filetype = data.mimetype;
        attachment.filesize = data.size;
        attachment.filedata = data.buffer;
        attachment.note = { id: entityId } as Note;
        return await this.repository.save(attachment);
        
        // return `Se guardo correctamente el archivo ${data.buffer} para la nota ${entityId}`;
    }
}