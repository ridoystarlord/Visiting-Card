import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";
import { ParseVisitingCardDto } from "./common/dtos/parse-visiting-card.dto";

@ApiTags("Common")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
