import { Module } from "@nestjs/common";
import { ExtractContactController } from "./extract-contact.controller";
import { ExtractContactService } from "./extract-contact.service";

@Module({
  controllers: [ExtractContactController],
  providers: [ExtractContactService],
})
export class ExtractContactModule {}
