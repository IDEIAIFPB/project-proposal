import { IsString, IsNotEmpty, IsObject } from "class-validator";

export class ContactDto {
    @IsString()
    @IsNotEmpty()
    wa_id: string;

    @IsObject()
    profile: {
        name: string;
    };
}
