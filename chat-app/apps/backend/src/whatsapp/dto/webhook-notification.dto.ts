import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { WebhookEntryDto } from "./webhook-entry.dto";


export class WebhookNotificationDto {
    @IsString()
    @IsNotEmpty()
    readonly object: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WebhookEntryDto)
    readonly entry: WebhookEntryDto[];
}
