import { IsEnum, IsObject, IsNotEmpty } from "class-validator";
import { FieldType } from "./shared/enums/field-type.enum";
import { MessageValueDto } from "./messages/message-value.dto";
import { StatusValueDto } from "./status/status-value.dto";

export class WebhookChangeDto<T extends MessageValueDto | StatusValueDto> {
    @IsEnum(FieldType)
    @IsNotEmpty()
    field: FieldType;

    @IsObject()
    value: T;
}
