import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    to: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    phone_number_id: string;

    @IsNotEmpty()
    @IsString()
    access_token: string;
}

export class WsSendMessageDto {
    @IsNotEmpty()
    @IsString()
    to: string;

    @IsNotEmpty()
    @IsString()
    message: string;
}

