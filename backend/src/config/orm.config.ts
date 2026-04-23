import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Note } from "src/note/model/note.model";
import { Noteshare } from "src/noteshare/model/noteshare.model";
import { Usuario } from "src/usuario/model/usuario.model";


export default registerAs(
    'orm.config',
    (): TypeOrmModuleOptions => ({
        /*
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: '1234',
        database: 'db',
        entities: [Usuario, Noteshare, Note, Noteshare],
        synchronize: true,
        */
         type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'sa',
        password: '123',
        database: 'postgres',
        entities: [Usuario, Noteshare, Note, Noteshare],
        synchronize: true,
    }),
);