import { ExtractedContact } from "@prisma/client";

import { RestrictProperties } from "../../../common/dtos/common.input";

export class ExtractContactEntity
  implements RestrictProperties<ExtractContactEntity, ExtractedContact>
{
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  website: string;
  source: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
