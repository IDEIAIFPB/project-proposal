import { IsString, IsNotEmpty } from "class-validator";

export class ButtonDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsNotEmpty()
    payload: string;
}
