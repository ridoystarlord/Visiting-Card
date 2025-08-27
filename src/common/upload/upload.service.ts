import { Injectable } from "@nestjs/common";

import { putObjectURL } from "../../utils/aws";

import { CreateUploadDto } from "./dto/create-upload.dto";

@Injectable()
export class UploadService {
  async createUploadUrl(createUploadDto: CreateUploadDto) {
    return await putObjectURL(
      createUploadDto.extension,
      createUploadDto.contentType,
      "visiting-card"
    );
  }
}
