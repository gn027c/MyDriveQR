-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'MISSING_FILE', 'NEED_REFRESH', 'DELETED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('QR_CREATED', 'QR_REGENERATED', 'FILE_UPLOADED', 'FILE_SYNCED', 'FILE_DELETION', 'FILE_MISSING', 'TOKEN_REFRESH', 'ERROR');

-- CreateEnum
CREATE TYPE "DriveStatus" AS ENUM ('OK', 'NOT_FOUND', 'PERMISSION_DENIED', 'DIFFERENT_CHECKSUM');

-- CreateEnum
CREATE TYPE "QRType" AS ENUM ('TEXT', 'URL', 'EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'TELEGRAM', 'WIFI', 'BANK', 'YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'GITHUB', 'FILE');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "assetId" TEXT,
    "metadata" JSONB,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveSyncState" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "status" "DriveStatus" NOT NULL DEFAULT 'OK',
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriveSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "type" "QRType" NOT NULL,
    "content" TEXT NOT NULL,
    "qrImage" TEXT NOT NULL,
    "fileURL" TEXT,
    "fileName" TEXT,
    "userEmail" TEXT NOT NULL,
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRAsset" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "title" TEXT,
    "type" "QRType" NOT NULL,
    "content" TEXT NOT NULL,
    "qrImage" TEXT NOT NULL,
    "driveFileId" TEXT,
    "driveFileName" TEXT,
    "driveFileLink" TEXT,
    "driveMimeType" TEXT,
    "driveChecksum" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "action" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_userEmail_createdAt_idx" ON "ActivityLog"("userEmail", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_assetId_idx" ON "ActivityLog"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "DriveSyncState_assetId_key" ON "DriveSyncState"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "QRCode_userEmail_idx" ON "QRCode"("userEmail");

-- CreateIndex
CREATE INDEX "QRCode_createdAt_idx" ON "QRCode"("createdAt");

-- CreateIndex
CREATE INDEX "QRCode_assetId_idx" ON "QRCode"("assetId");

-- CreateIndex
CREATE INDEX "QRAsset_userEmail_createdAt_idx" ON "QRAsset"("userEmail", "createdAt");

-- CreateIndex
CREATE INDEX "QRAsset_status_idx" ON "QRAsset"("status");

-- CreateIndex
CREATE INDEX "Log_level_idx" ON "Log"("level");

-- CreateIndex
CREATE INDEX "Log_userEmail_idx" ON "Log"("userEmail");

-- CreateIndex
CREATE INDEX "Log_action_idx" ON "Log"("action");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "QRAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveSyncState" ADD CONSTRAINT "DriveSyncState_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "QRAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "QRAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRAsset" ADD CONSTRAINT "QRAsset_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
