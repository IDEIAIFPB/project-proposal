import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class TextDto {
    @IsString()
    @IsNotEmpty()
    body: string;

    @IsBoolean()
    @IsOptional()
    preview_url?: boolean;
}
