import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../common/database/database.service";
import { calculatePagination, IOptions } from "../../utils/pagination";
import { UpdateExtractContactDto } from "./dtos/update.dto";

@Injectable()
export class ExtractContactService {
  constructor(private database: DatabaseService) {}

  async getExtractContact(filter: any, orderBy: any, pagination: IOptions) {
    const { page, limit, skip } = calculatePagination(pagination);

    let result = [];
    if (pagination.page && pagination.limit) {
      result = await this.database.extractedContact.findMany({
        where: { ...filter },
        orderBy: orderBy,
        take: limit,
        skip: skip,
      });
    } else {
      result = await this.database.extractedContact.findMany({
        where: { ...filter },
        orderBy: orderBy,
      });
    }
    const total = await this.database.extractedContact.count({
      where: { ...filter },
    });
    return {
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
      data: result,
    };
  }

  getExtractContactById(id: string) {
    return this.database.extractedContact.findUnique({ where: { id } });
  }

  updateExtractContactById(id: string, data: UpdateExtractContactDto) {
    return this.database.extractedContact.update({ where: { id }, data: data });
  }

  deleteExtractContactById(id: string) {
    return this.database.extractedContact.delete({ where: { id } });
  }
}
