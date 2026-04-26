import { Body, Controller, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { FileInterceptor } from "@nestjs/platform-express";

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

    @Post('getbyid/:id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.service.getById(id);
    }

    @Post('save')
    @UseInterceptors(FileInterceptor('file'))
    async save(
        @UploadedFile() file: Express.Multer.File,
        @Body('note_id', ParseIntPipe) noteId: number,
    ) {
        return await this.service.save(file, noteId);
    }

    @Post('delete/:id')
    async deleteById(@Param('id', ParseIntPipe) id: number) {
        return await this.service.delete(id);
    }
}