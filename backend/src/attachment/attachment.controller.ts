import { Controller, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@Controller('attachment')
// @UseGuards(AuthGuard('jwt'))
export class AttachmentController {
    constructor(
        private readonly service: AttachmentService
    ) {}

    @Post('getall')
    getAll() {
        return this.service.getAll();
    }

    @Post('upload/:id')
    @UseInterceptors(FileInterceptor('file'))
    async saveFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: number) {
        console.log('Archivo recibido:', file);
        return await this.service.save(file, id);
    }
}