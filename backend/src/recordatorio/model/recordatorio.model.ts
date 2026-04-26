import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}