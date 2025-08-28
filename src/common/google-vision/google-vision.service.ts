import { Injectable } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";

@Injectable()
export class GoogleVisionService {
  private client: ImageAnnotatorClient;

  constructor() {
    // Use API key from environment variable
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Google Vision API key not found. Set GOOGLE_VISION_API_KEY env variable."
      );
    }
    this.client = new ImageAnnotatorClient({ apiKey });
  }

  async extractTextFromImage(imageBuffer: Buffer) {
    try {
      const [result] = await this.client.textDetection({
        image: { content: new Uint8Array(imageBuffer) },
        imageContext: {
          textDetectionParams: { enableTextDetectionConfidenceScore: true },
        },
      });
      const detections = result.textAnnotations || [];
      if (detections.length === 0) {
        throw new Error("No text detected in image");
      }
      const fullText = detections[0].description || "";
      const confidence = detections[0].confidence || 0;
      const textSegments = detections.slice(1).map((detection) => ({
        text: detection.description,
        confidence: detection.confidence,
        boundingBox: detection.boundingPoly,
      }));
      console.log({
        fullText,
        confidence,
        textSegments,
        wordCount: textSegments.length,
      });
      return {
        fullText,
        confidence,
        textSegments,
        wordCount: textSegments.length,
      };
    } catch (error) {
      console.error("Google Vision OCR failed:", error);
      throw new Error(
        `OCR processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
