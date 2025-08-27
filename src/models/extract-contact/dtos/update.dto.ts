import { PartialType } from "@nestjs/swagger";

import { CreateExtractContactDto } from "./create.dto";

export class UpdateExtractContactDto extends PartialType(
  CreateExtractContactDto
) {}
