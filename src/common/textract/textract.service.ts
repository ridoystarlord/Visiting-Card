import vision from "@google-cloud/vision";
import {
  AnalyzeDocumentCommand,
  FeatureType,
  TextractClient,
} from "@aws-sdk/client-textract";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class TextractService {
  private textract: TextractClient;

  constructor(
    private readonly prisma: DatabaseService,
    private readonly configService: ConfigService
  ) {
    this.textract = new TextractClient({
      region: this.configService.get<string>("S3_AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get<string>("S3_AWS_ACCESS_KEY"),
        secretAccessKey: this.configService.get<string>("S3_AWS_SECRET_ACCESS"),
      },
    });
  }

  async extractWithGoogleVision(imageUrl: string): Promise<any> {
    // Download image from URL
    const imageBuffer = await this.downloadImage(imageUrl);

    // Initialize Google Vision client
    const vision = require("@google-cloud/vision");
    const client = new vision.ImageAnnotatorClient();

    // Call Google Vision API
    const [result] = await client.textDetection({
      image: { content: imageBuffer },
    });
    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      throw new Error("No text detected by Google Vision");
    }

    // Split detected text into lines
    const lines = detections[0].description
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // Use the same parsing logic as Textract
    const parsed = this.parseTextract({
      Blocks: lines.map((text) => ({ BlockType: "LINE", Text: text })),
    });
    return parsed;
  }

  async extractAndSave(imageUrl: string) {
    // Download image from URL
    const imageBuffer = await this.downloadImage(imageUrl);

    // Call AWS Textract using v3 SDK
    const input = {
      Document: { Bytes: new Uint8Array(imageBuffer) },
      FeatureTypes: [FeatureType.FORMS],
    };
    const command = new AnalyzeDocumentCommand(input);
    const textractResult = await this.textract.send(command);

    // Parse Textract result
    const extracted = this.parseTextract(textractResult);
    // Save to DB
    return this.prisma.extractedContact.create({
      data: {
        ...extracted,
        source: imageUrl,
      },
    });
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to download image");
    return Buffer.from(await res.arrayBuffer());
  }

  private parseTextract(textractResult: any) {
    // Improved parsing logic for visiting cards
    const fields: any = {};
    const textBlocks =
      textractResult.Blocks?.filter((b) => b.BlockType === "LINE") || [];
    const lines = textBlocks.map((b) => b.Text?.trim()).filter(Boolean);

    // Regex patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex =
      /(?:\+\d{1,3}[\s-]?)?(?:\(\d{1,4}\)[\s-]?)?(?:\d[\s-]?){8,15}/;
    const websiteRegex =
      /(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?/;
    const jobKeywords = [
      "Manager",
      "Director",
      "Engineer",
      "Developer",
      "Lead",
      "Officer",
      "President",
      "CEO",
      "CTO",
      "CFO",
      "Founder",
      "Consultant",
      "Specialist",
      "Analyst",
      "Designer",
      "Administrator",
      "Supervisor",
      "Coordinator",
      "Executive",
      "Assistant",
      "Sales",
      "Marketing",
      "Business",
      "Account",
      "HR",
      "Human Resources",
      "Operations",
      "Product",
      "Project",
      "Finance",
      "Legal",
    ];

    // Extract emails, phones, websites
    fields.emails = lines.filter((line) => emailRegex.test(line));
    fields.phones = lines
      .filter((line) => phoneRegex.test(line))
      .map((line) => line.replace(/[\s\-()]/g, ""));
    fields.websites = lines.filter(
      (line) => websiteRegex.test(line) && !emailRegex.test(line)
    );

    // Assign first found values for DB fields
    fields.email = fields.emails.length ? fields.emails[0] : undefined;
    fields.phone = fields.phones.length ? fields.phones[0] : undefined;
    fields.website = fields.websites.length ? fields.websites[0] : undefined;

    // Job title detection: look for job keywords, prefer lines after name
    let jobLine = lines.find((line) =>
      jobKeywords.some((keyword) =>
        new RegExp(`\\b${keyword}\\b`, "i").test(line)
      )
    );
    if (!jobLine && lines.length > 1) {
      // Try next line after name
      const nameIdx = lines.findIndex((line) => line === fields.name);
      if (nameIdx >= 0 && nameIdx < lines.length - 1) {
        const nextLine = lines[nameIdx + 1];
        if (
          jobKeywords.some((keyword) =>
            new RegExp(`\\b${keyword}\\b`, "i").test(nextLine)
          )
        ) {
          jobLine = nextLine;
        }
      }
    }
    fields.jobTitle = jobLine;

    // Company detection: look for all caps, or line before/after job title
    let companyLine = lines.find(
      (line) =>
        /^[A-Z0-9 .,&'-]{4,}$/.test(line) &&
        !emailRegex.test(line) &&
        !phoneRegex.test(line)
    );
    if (!companyLine && jobLine) {
      const jobIdx = lines.findIndex((line) => line === jobLine);
      if (jobIdx > 0) {
        const prevLine = lines[jobIdx - 1];
        if (
          prevLine &&
          !emailRegex.test(prevLine) &&
          !phoneRegex.test(prevLine) &&
          !websiteRegex.test(prevLine)
        ) {
          companyLine = prevLine;
        }
      }
    }
    fields.company = companyLine;

    // Name detection: first line that is not email, phone, website, company, or job title
    fields.name = lines.find(
      (line) =>
        !emailRegex.test(line) &&
        !phoneRegex.test(line) &&
        !websiteRegex.test(line) &&
        line !== companyLine &&
        line !== jobLine
    );

    return {
      email: fields.email,
      phone: fields.phone,
      website: fields.website,
      jobTitle: fields.jobTitle,
      company: fields.company,
      name: fields.name,
    };
  }
}
