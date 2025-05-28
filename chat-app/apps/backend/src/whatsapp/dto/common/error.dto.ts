import { IsNumber, IsString, IsNotEmpty } from "class-validator";

export class ErrorDto {
    @IsNumber()
    code: number;

    @IsString()
    @IsNotEmpty()
    message: string;
}
