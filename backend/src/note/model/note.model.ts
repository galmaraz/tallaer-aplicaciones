import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
