import { IsString, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { MetadataDto } from "../common/metadata.dto";
import { StatusDto } from "./status.dto";

export class StatusValueDto {
    @IsString()
    @IsNotEmpty()
    messaging_product: "whatsapp";

    @Type(() => MetadataDto)
    metadata: MetadataDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StatusDto)
    statuses: StatusDto[];
}
