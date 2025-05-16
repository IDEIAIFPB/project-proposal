import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("app_user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ unique: true })
    document: string;

    @Column()
    phone: string;

    @Column({ type: "date", name: "date_of_birth" })
    dateOfBirth: Date;

    @CreateDateColumn({ type: "timestamp", name: "created_at" })
    createdAt: Date;

    @Column({ default: false, name: "is_confirmed" })
    isConfirmed: boolean;

    @Column({ type: "varchar", name: "confirmation_code", nullable: true })
    confirmationCode: string | null;

    @Column({ type: "varchar", name: "reset_code", nullable: true })
    resetCode: string | null;
}
