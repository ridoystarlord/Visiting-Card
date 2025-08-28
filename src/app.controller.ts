import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";
import { ParseVisitingCardDto } from "./common/dtos/parse-visiting-card.dto";

@ApiTags("Common")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("crm-sync")
  async crmSync(@Body() record: any) {
    // For mock: just log and return the record
    // console.log("CRM Sync received:", record);
    return {
      success: true,
      message: "CRM sync received",
      data: record,
      statusCode: HttpStatus.OK,
    };
  }

  @Post("parse-visiting-card")
  async ParseVisitingCard(@Body() parseDataDto: ParseVisitingCardDto) {
    await this.appService.parseVisitingCard(parseDataDto.imageUrl);

    return {
      success: true,
      message: "Parse Visiting Card Successfully",
      statusCode: HttpStatus.CREATED,
    };
  }
}
