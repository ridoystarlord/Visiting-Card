import { Injectable } from "@nestjs/common";
import { TextractService } from "./common/textract/textract.service";
import { GoogleVisionService } from "./common/google-vision/google-vision.service";
import axios from "axios";

@Injectable()
export class AppService {
  constructor(
    private textractService: TextractService,
    private googleVisionService: GoogleVisionService
  ) {}

  /**
   * Parse a visiting card using either AWS Textract or Google Vision
   * @param imageUrl URL of the image
   * @param provider 'textract' | 'google' (default: 'textract')
   */
  async parseVisitingCard(imageUrl: string, provider?: string) {
    if (!imageUrl) return null;
    if (provider === "google") {
      // Download image and use Google Vision
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error("Failed to download image");
      const imageBuffer = Buffer.from(await res.arrayBuffer());
      return this.googleVisionService.extractTextFromImage(imageBuffer);
    } else {
      // Default: AWS Textract
      const data = await this.textractService.extractAndSave(imageUrl);
      const baseUrl = process.env.BACKEND_URL || "http://localhost:5001";
      // Send to CRM endpoint
      await axios.post(`${baseUrl}/api/v1/crm-sync`, data);
      return data;
    }
  }
}
