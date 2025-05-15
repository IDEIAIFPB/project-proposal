import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 50, unique: true })
    username: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ length: 20, unique: true })
    document: string;

    @Column({ length: 15 })
    phone: string;

    @Column({ type: "date" })
    dateOfBirth: Date;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Column({ default: false })
    isConfirmed: boolean;

    @Column({ type: "varchar", length: 8, nullable: true })
    confirmationCode: string | null;

    @Column({ type: "varchar", length: 8, nullable: true })
    resetCode: string | null;
}
