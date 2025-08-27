import { OmitType } from "@nestjs/swagger";
import { ExtractContactEntity } from "../entity/extract-contact.entity";

export class CreateExtractContactDto extends OmitType(ExtractContactEntity, [
  "createdAt",
  "updatedAt",
  "id",
]) {
  imageUrl?: string;
}
