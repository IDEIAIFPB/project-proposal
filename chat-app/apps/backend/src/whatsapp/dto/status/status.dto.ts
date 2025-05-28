import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { ErrorDto } from "../common/error.dto";
import { MessageStatus } from "../shared/enums/message-status.enum";

export class StatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    recipient_id: string;

    @IsDateString()
    timestamp: string;

    @IsEnum(MessageStatus)
    status: MessageStatus;

    @IsOptional()
    conversation?: {
        id: string;
        expiration_timestamp?: string;
    };

    @IsArray()
    @Type(() => ErrorDto)
    @IsOptional()
    errors?: ErrorDto[];
}
