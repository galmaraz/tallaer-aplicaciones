import { Body, Controller, Param, ParseIntPipe, Post } from "@nestjs/common";
import { NoteshareDto } from "./dto/noteshare.dto";
import { NoteShareService } from "./noteshare.service";

@Controller("notesharecontroller")
export class NoteShareController {
    constructor(private readonly service: NoteShareService) {}

    @Post('getall')
    async getAll() { return await this.service.getAll(); }

    @Post('getbyid/:id')
    async get(@Param('id', ParseIntPipe) id: number) { return await this.service.getById(id); }

    @Post('getbyuser/:userId')
    async getByUser(@Param('userId', ParseIntPipe) userId: number) { return await this.service.getByUser(userId); }

    @Post('getbynote/:noteId')
    async getByNote(@Param('noteId', ParseIntPipe) noteId: number) { return await this.service.getByNote(noteId); }

    @Post('save')
    async save(@Body() data: NoteshareDto) { return await this.service.save(data); }

    @Post('deletebyid/:id')
    async delete(@Param('id', ParseIntPipe) id: number) { return await this.service.delete(id); }
}