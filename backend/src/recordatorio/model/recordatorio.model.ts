import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../note/model/note.model';

@Entity('recordatorios')
export class Recordatorio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp' })
  fechaRecordatorio: Date;

  @Column({ default: false })
  completado: boolean;

  @Column({ default: true })
  estado: boolean;

  @ManyToOne(() => Note, note => note.recordatorios, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  note: Note;
}