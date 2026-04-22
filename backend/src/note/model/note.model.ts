import { IsBoolean } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Note {
    @PrimaryGeneratedColumn({name: 'note_id'})
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    @IsBoolean()
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}