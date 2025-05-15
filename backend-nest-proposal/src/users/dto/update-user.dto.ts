import { IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, Validate } from "class-validator";
import { AdultGuard } from "../../common/validators/adult.guard";

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    @MinLength(3, { message: "O username deve ter ao menos 3 caracteres." })
    @MaxLength(50, { message: "O username deve ter ao máximo 50 caracteres." })
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100, { message: "O nome deve ter ao máximo 100 caracteres." })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: "Email inválido." })
    @MaxLength(100, { message: "O email deve ter ao máximo 100 caracteres." })
    email?: string;

    @IsOptional()
    @IsDateString({}, { message: "Data de nascimento deve estar no formato ISO (YYYY-MM-DD)." })
    @Validate(AdultGuard, { message: "O usuário deve ter no mínimo 18 anos." })
    dateOfBirth?: string;

    @IsOptional()
    @IsString({ message: "Documento deve ser uma string." })
    @Matches(/^[0-9]{11,14}$/, { message: "Documento deve conter apenas dígitos (11 a 14 caracteres)." })
    @MaxLength(20, { message: "O documento deve ter ao máximo 20 caracteres." })
    document?: string;

    @IsOptional()
    @IsString({ message: "Telefone deve ser uma string." })
    @MaxLength(15, { message: "O telefone deve ter ao máximo 15 caracteres." })
    @Matches(/^[0-9]{10,11}$/, { message: "Telefone deve conter apenas dígitos (10 a 11 caracteres)." })
    phone?: string;

}
