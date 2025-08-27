import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
export class CreateUploadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  extension: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
