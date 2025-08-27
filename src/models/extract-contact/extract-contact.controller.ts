import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ExtractContactQueryDto } from "./dtos/query.dto";
import { UpdateExtractContactDto } from "./dtos/update.dto";
import { ExtractContactService } from "./extract-contact.service";

@ApiTags("Extract Contacts")
@Controller("extract-contacts")
export class ExtractContactController {
  constructor(private readonly extractContactService: ExtractContactService) {}

  @Get("")
  async findAll(
    @Query()
    { page, limit, order, sortBy, search, searchBy }: ExtractContactQueryDto
  ) {
    const filter: any = {};
    let orderBy: any = {};
    if (searchBy) {
      filter[searchBy] = {
        contains: search,
        mode: "insensitive",
      };
    }
    if (order) {
      orderBy[sortBy] = order || "asc";
    } else {
      orderBy = { createdAt: "desc" };
    }

    const { data, pagination } =
      await this.extractContactService.getExtractContact(filter, orderBy, {
        page,
        limit,
      });
    return {
      success: true,
      message: "Extract Contact Retrieved Successfully",
      statusCode: HttpStatus.OK,
      pagination,
      data: data,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.extractContactService.getExtractContactById(id);
    return {
      success: true,
      message: "Extract Contact Retrieved By Id Successfully",
      statusCode: HttpStatus.OK,
      data: data,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateExtractContactDto: UpdateExtractContactDto
  ) {
    await this.extractContactService.updateExtractContactById(
      id,
      updateExtractContactDto
    );
    return {
      success: true,
      message: "Extract Contact Updated Successfully",
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.extractContactService.deleteExtractContactById(id);
    return {
      success: true,
      message: "Extract Contact Deleted Successfully",
      statusCode: HttpStatus.OK,
    };
  }
}
