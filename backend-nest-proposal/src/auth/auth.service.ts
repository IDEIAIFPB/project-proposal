import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { SignUpDTO } from "./dto/signup.dto";
import { LoginDTO } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async signUp(dto: SignUpDTO) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const user = await this.usersService.create({
            ...dto,
            password: hashedPassword,
            isConfirmed: false
        });

        return { message: `Usuário ${user.username} cadastrado. Verifique o código de confirmação nos logs.` };
    }

    async login(dto: LoginDTO) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException("Credenciais inválidas.");
        if (!user.isConfirmed) throw new UnauthorizedException("Conta não confirmada.");

        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException("Credenciais inválidas.");

        const payload = { sub: user.id, username: user.username, email: user.email };
        return { access_token: this.jwtService.sign(payload) };
    }

    async generateConfirmationCode(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException("Usuário não encontrado.");
        if (user.isConfirmed) throw new BadRequestException("Conta já confirmada.");

        const confirmationCode = Math.random().toString(36).substring(2, 8);
        await this.usersService.setConfirmCode(user.id, confirmationCode);
        console.log(`Código de confirmação do usuário (${user.username}): ${confirmationCode}`);

        return { message: "Código de confirmação gerado. Verifique os logs." };
    }

    async confirmAccount(email: string, code: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException("Usuário não encontrado.");
        if (user.confirmationCode !== code) throw new BadRequestException("Código inválido.");

        return this.usersService.confirmUser(user.id);
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException("Usuário não encontrado.");
        if (!user.isConfirmed) throw new UnauthorizedException("Conta não confirmada.");

        const resetCode = Math.random().toString(36).substring(2, 8);
        await this.usersService.setResetCode(user.id, resetCode);
        console.log(`Reset code for ${email}: ${resetCode}`);

        return { message: "Código de reset gerado. Verifique os logs." };
    }

    async resetPassword(email: string, code: string, newPassword: string, confirmPassword: string) {
        if (newPassword !== confirmPassword) throw new BadRequestException("As senhas não coincidem.");

        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException("Usuário não encontrado.");
        if (!user.isConfirmed) throw new UnauthorizedException("Conta não confirmada.");
        if (user.resetCode && user.resetCode !== code) throw new BadRequestException("Código inválido.");

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.usersService.updatePassword(user.id, hashedPassword);
        return { message: "Senha redefinida com sucesso." };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string) {
        if (newPassword !== confirmPassword) throw new BadRequestException("As senhas não coincidem.");

        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException("Usuário não encontrado.");
        if (!user.isConfirmed) throw new UnauthorizedException("Conta não confirmada.");

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) throw new UnauthorizedException("Senha atual incorreta.");

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.usersService.updatePassword(userId, hashedPassword);

        return { message: "Senha alterada com sucesso." };
    }
}
