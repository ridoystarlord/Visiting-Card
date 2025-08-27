import { Injectable } from "@nestjs/common";
import { TextractService } from "./common/textract/textract.service";

@Injectable()
export class AppService {
  constructor(private textractService: TextractService) {}

  async parseVisitingCard(imageUrl: string) {
    // If imageUrl is provided, use Textract to extract info
    if (imageUrl) {
      const extracted = await this.textractService.extractAndSave(imageUrl);
      return extracted;
    }
  }
}
