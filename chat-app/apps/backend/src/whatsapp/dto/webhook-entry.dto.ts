import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { WebhookChangeDto } from "./webhook-change.dto";
import { MessageValueDto } from "./messages/message-value.dto";
import { StatusValueDto } from "./status/status-value.dto";


export class WebhookEntryDto {
    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @IsArray()
    @ValidateNested({ each: true })
    readonly changes: WebhookChangeDto<MessageValueDto | StatusValueDto>[];
}

