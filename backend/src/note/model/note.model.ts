import { IsBoolean } from 'class-validator';
import { Usuario } from 'src/usuario/model/usuario.model';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Note {
  @PrimaryGeneratedColumn({ name: 'note_id' })
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ default: false })
  deleted!: boolean;

  @ManyToOne(() => Usuario, data => data.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuario_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}