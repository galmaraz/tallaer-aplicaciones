import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Note } from "src/note/model/note.model";
import { Noteshare } from "src/noteshare/model/noteshare.model";
import { Usuario } from "src/usuario/model/usuario.model";
import { Recordatorio } from "src/recordatorio/model/recordatorio.model";
import { Attachment } from "src/attachment/model/attachment.model";


export default registerAs(
    'orm.config',
    (): TypeOrmModuleOptions => ({
        
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: '1234',
        database: 'db',
        entities: [Usuario, Noteshare, Note, Noteshare, Recordatorio, Attachment],
        synchronize: true,
        
        //  type: 'postgres',
        // host: '127.0.0.1',
        // port: 5432,
        // username: 'sa',
        // password: '1844',
        // database: 'googlekeep-db',
        // entities: [Usuario, Noteshare, Note, Recordatorio, Attachment],
        // synchronize: true,
    }),
);