import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ParseVisitingCardDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
