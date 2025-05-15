import { IsString, IsEmail, MinLength, IsDateString, Validate, Matches, MaxLength } from "class-validator";
import { AdultGuard } from "../../common/validators/adult.guard";

export class SignUpDTO {
    @IsString()
    @MinLength(3, { message: "O username deve ter ao menos 3 caracteres." })
    @MaxLength(50, { message: "O username deve ter ao máximo 50 caracteres." })
    username: string;

    @IsString()
    @MaxLength(100, { message: "O nome deve ter ao máximo 100 caracteres." })
    name: string;

    @IsEmail({}, { message: "Email inválido." })
    @MaxLength(100, { message: "O email deve ter ao máximo 100 caracteres." })
    email: string;

    @IsString({ message: "Senha deve ser uma string." })
    @MinLength(6, { message: "A senha deve ter ao menos 6 caracteres." })
    password: string;

    @IsDateString({}, { message: "Data de nascimento deve estar no formato ISO (YYYY-MM-DD)." })
    @Validate(AdultGuard, { message: "O usuário deve ter no mínimo 18 anos." })
    dateOfBirth: string;

    @IsString({ message: "Documento deve ser uma string." })
    @Matches(/^[0-9]{11,14}$/, { message: "Documento deve conter apenas dígitos (11 a 14 caracteres)." })
    @MaxLength(20, { message: "O documento deve ter ao máximo 20 caracteres." })
    document: string;

    @IsString({ message: "Telefone deve ser uma string." })
    @MaxLength(15, { message: "O telefone deve ter ao máximo 15 caracteres." })
    @Matches(/^[0-9]{10,11}$/, { message: "Telefone deve conter apenas dígitos (10 a 11 caracteres)." })
    phone: string;
}
