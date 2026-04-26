import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { RecordatorioService } from './recordatorio.service';
import { RecordatorioDto } from './dto/recordatorio.dto';

@Controller('recordatorios')
export class RecordatorioController {
  constructor(private readonly recordatorioService: RecordatorioService) {}

  @Get()
  listarTodos() {
    return this.recordatorioService.listarTodos();
  }

  @Get('pendientes')
  pendientes() {
    return this.recordatorioService.pendientes();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.recordatorioService.buscarPorId(+id);
  }

  @Post()
  crear(@Body() recordatorioDto: RecordatorioDto) {
    return this.recordatorioService.crear(recordatorioDto);
  }

  @Put(':id')
  actualizar(
    @Param('id') id: string,
    @Body() recordatorioDto: RecordatorioDto,
  ) {
    return this.recordatorioService.actualizar(+id, recordatorioDto);
  }

  @Patch(':id/completar')
  completar(@Param('id') id: string) {
    return this.recordatorioService.completar(+id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.recordatorioService.eliminar(+id);
  }
}