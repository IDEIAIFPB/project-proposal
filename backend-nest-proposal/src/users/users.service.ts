import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async create(dto: CreateUserDTO): Promise<User> {
        if (await this.repository.findOne({ where: { email: dto.email } }))
            throw new BadRequestException("Email já cadastrado.");

        if (await this.repository.findOne({ where: { username: dto.username } }))
            throw new BadRequestException("Username já em uso.");

        if (await this.repository.findOne({ where: { document: dto.document } }))
            throw new BadRequestException("Documento já cadastrado.");

        const user = this.repository.create(dto);
        return this.repository.save(user);
    }

    findAll(): Promise<User[]> {
        return this.repository.find();
    }

    async findById(id: string): Promise<User> {
        const user = await this.repository.findOne({ where: { id } });
        if (!user)
            throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.repository.findOne({ where: { email } });
        if (!user)
            throw new NotFoundException(`Usuário com email ${email} não encontrado.`);
        return user;
    }

    async update(id: string, dto: UpdateUserDTO): Promise<User> {
        if (dto.email && await this.repository.findOne({ where: { email: dto.email } }))
            throw new BadRequestException("Email já cadastrado.");

        if (dto.username && await this.repository.findOne({ where: { username: dto.username } }))
            throw new BadRequestException("Username já em uso.");

        if (dto.document && await this.repository.findOne({ where: { document: dto.document } }))
            throw new BadRequestException("Documento já cadastrado.");

        await this.repository.update(id, dto);
        return this.findById(id);
    }

    async remove(id: string): Promise<void> {
        if (!await this.repository.findOne({ where: { id } }))
            throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
        await this.repository.delete(id);
    }

    async confirmUser(id: string): Promise<{ message: string }> {
        await this.repository.update(id, { isConfirmed: true, confirmationCode: null });
        return { message: "Conta confirmada com sucesso." };
    }

    async setResetCode(id: string, code: string): Promise<void> {
        if (!await this.repository.findOne({ where: { id } }))
            throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
        await this.repository.update(id, { resetCode: code });
    }

    async setConfirmCode(id: string, code: string): Promise<void> {
        if (!await this.repository.findOne({ where: { id } }))
            throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
        await this.repository.update(id, { confirmationCode: code });
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        if (!await this.repository.findOne({ where: { id } }))
            throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
        await this.repository.update(id, { password: hashedPassword, resetCode: null });
    }
}
