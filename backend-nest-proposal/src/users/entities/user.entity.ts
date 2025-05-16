import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("app_user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 255, unique: true })
    username: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ length: 255 })
    password: string;

    @Column({ length: 255, unique: true })
    document: string;

    @Column({ length: 255 })
    phone: string;

    @Column({ type: "date", name: "date_of_birth" })
    dateOfBirth: Date;

    @CreateDateColumn({ type: "timestamp", name: "created_at" })
    createdAt: Date;

    @Column({ default: false, name: "is_confirmed" })
    isConfirmed: boolean;

    @Column({ type: "varchar", name: "confirmation_code", length: 255, nullable: true })
    confirmationCode: string | null;

    @Column({ type: "varchar", name: "reset_code", length: 255, nullable: true })
    resetCode: string | null;
}
