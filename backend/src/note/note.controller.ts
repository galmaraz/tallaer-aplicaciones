import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteDto } from './dto/note.dto';

@Controller('notecontroller')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Post('getall/:userId')
  getAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getAllForUser(userId);
  }

  @Post('gettrash')
  getTrash() {
    return this.service.getTrash();
  }

  @Post('getbyid/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post('save')
  async save(@Body() data: NoteDto) {
    return await this.service.save(data);
  }

  @Post('softdelete/:id')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.service.softDelete(id);
  }

  @Post('restore/:id')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return await this.service.restore(id);
  }

  @Post('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.service.delete(id);
  }

  @Post('duplicate/:id/:userId')
    async duplicate(
      @Param('id', ParseIntPipe) id: number,
      @Param('userId', ParseIntPipe) userId: number,
    ) {
      return await this.service.duplicate(id, userId);
  }
  

}