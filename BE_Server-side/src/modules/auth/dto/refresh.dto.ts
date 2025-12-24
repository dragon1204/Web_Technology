import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshDto {
    @IsString()

    @ApiProperty({description:"refresh_token"})
    refrehtoken : string;
}
