import { Note } from "src/note/model/note.model";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    filename: string;
    @Column()
    filetype: string;
    @Column({ nullable: true })
    filesize: number;
    @Column({ type: 'bytea' })
    filedata: Buffer;

    @ManyToOne(() => Note, note => note.id)
    @JoinColumn({ name: 'note_id' })
    note: Note;
}