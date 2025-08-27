import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ResponseInterceptor } from "../../common/interceptor/ResponseInterceptor";

import { CreateUploadDto } from "./dto/create-upload.dto";
import { UploadService } from "./upload.service";

@ApiTags("Common")
@UseInterceptors(ResponseInterceptor)
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("new")
  async CreateUploadUrl(@Body() createUploadDto: CreateUploadDto, @Req() req) {
    const data = await this.uploadService.createUploadUrl(
      createUploadDto,
      req?.user?.id
    );
    return {
      success: true,
      message: "Upload URL Generated Successfully",
      statusCode: HttpStatus.CREATED,
      data,
    };
  }
}
