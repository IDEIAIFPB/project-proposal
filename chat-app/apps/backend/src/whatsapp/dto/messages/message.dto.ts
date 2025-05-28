import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from "class-validator";
import { MessageType } from "../shared/enums/message-type.enum";
import { TextDto } from "./text.dto";

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    from: string;

    @IsString()
    @IsNotEmpty()
    id: string;

    @IsDateString()
    timestamp: string;

    @IsEnum(MessageType)
    type: MessageType;

    @Type(() => TextDto)
    @IsOptional()
    text?: TextDto;
}
