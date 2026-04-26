import {
    Body,
    Controller,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Post,
    FileTypeValidator,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('attachment')
// @UseGuards(AuthGuard('jwt'))
export class AttachmentController {
    constructor(private readonly service: AttachmentService) {}

    @Post('getall')
    getAll() {
        return this.service.getAll();
    }

    @Post('getbyid/:id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.service.getById(id);
    }

    @Post('getbynote/:noteId')
    getByNote(@Param('noteId', ParseIntPipe) noteId: number) {
        return this.service.getByNoteId(noteId);
    }

    @Post('save')
    @UseInterceptors(FileInterceptor('file'))
    async save(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^(image\/png|image\/jpe?g|image\/webp)$/i }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('note_id', ParseIntPipe) noteId: number,
    ) {
        return await this.service.save(file, noteId);
    }

    @Post('delete/:id')
    async deleteById(@Param('id', ParseIntPipe) id: number) {
        return await this.service.delete(id);
    }
}