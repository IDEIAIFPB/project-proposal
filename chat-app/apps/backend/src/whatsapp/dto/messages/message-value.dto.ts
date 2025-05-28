import { IsString, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { MetadataDto } from "../common/metadata.dto";
import { MessageDto } from "./message.dto";
import { ContactDto } from "../common/contact.dto";

export class MessageValueDto {
    @IsString()
    @IsNotEmpty()
    messaging_product: "whatsapp";

    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactDto)
    contacts: ContactDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];
}
