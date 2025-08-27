-- CreateTable
CREATE TABLE "ExtractedContacts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "website" TEXT,
    "source" TEXT,

    CONSTRAINT "ExtractedContacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLogs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "requestBody" JSONB,
    "requestParams" JSONB,

    CONSTRAINT "RequestLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtractedContacts_email_key" ON "ExtractedContacts"("email");

-- CreateIndex
CREATE INDEX "ExtractedContacts_email_phone_idx" ON "ExtractedContacts"("email", "phone");

-- CreateIndex
CREATE INDEX "RequestLogs_method_idx" ON "RequestLogs"("method");
