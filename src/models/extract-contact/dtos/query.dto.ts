import { Prisma } from "@prisma/client";
import { IsIn, IsOptional } from "class-validator";

import { BaseQueryDto } from "../../../common/dtos/common.dto";

export class ExtractContactQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsIn(Object.values(Prisma.ExtractedContactScalarFieldEnum))
  sortBy?: string;

  @IsOptional()
  @IsIn(Object.values(Prisma.ExtractedContactScalarFieldEnum))
  searchBy?: string;
}
