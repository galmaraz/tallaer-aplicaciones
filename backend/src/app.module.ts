import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario/usuario.controller';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario/model/usuario.model';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './usuario/usuario.service';
import { Noteshare } from './noteshare/model/noteshare.model';
import { Note } from './note/model/note.model';
import { NoteShareController } from './noteshare/noteshare.controller';
import { NoteShareService } from './noteshare/noteshare.service';
import { NoteController } from './note/note.controller';
import { NoteService } from './note/note.service';
import { Recordatorio } from './recordatorio/model/recordatorio.model';
import { RecordatorioController } from './recordatorio/recordatorio.controller';
import { RecordatorioService } from './recordatorio/recordatorio.service';
import { Attachment } from './attachment/model/attachment.model';
import { AttachmentController } from './attachment/attachment.controller';
import { AttachmentService } from './attachment/attachment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ormConfig.KEY],
      useFactory: (config) => config,
    }),
    TypeOrmModule.forFeature([
      Usuario,
      Noteshare,
      Note,
      Recordatorio,
      Attachment,
    ]),
  ],
  controllers: [
    UsuarioController,
    NoteShareController,
    NoteController,
    RecordatorioController,
    AttachmentController,
  ],
  providers: [
    UsuarioService,
    NoteShareService,
    NoteService,
    RecordatorioService,
    AttachmentService,
  ],
})
export class AppModule {}
