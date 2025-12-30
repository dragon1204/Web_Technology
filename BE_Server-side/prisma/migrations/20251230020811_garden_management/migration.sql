/*
  Warnings:

  - Added the required column `updatedAt` to the `Garden` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `SensorData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vegetable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Garden" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SensorData" ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Vegetable" ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" SERIAL NOT NULL,
    "sensorId" INTEGER,
    "sensorType" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "alertOnMin" BOOLEAN NOT NULL DEFAULT false,
    "alertOnMax" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gardenId" INTEGER NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "sensorId" INTEGER,
    "value" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "vegetableId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" INTEGER,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "userId" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AlertRule_gardenId_idx" ON "AlertRule"("gardenId");

-- CreateIndex
CREATE INDEX "AlertRule_sensorId_idx" ON "AlertRule"("sensorId");

-- CreateIndex
CREATE INDEX "Alert_ruleId_idx" ON "Alert"("ruleId");

-- CreateIndex
CREATE INDEX "Alert_sensorId_idx" ON "Alert"("sensorId");

-- CreateIndex
CREATE INDEX "Alert_isResolved_idx" ON "Alert"("isResolved");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "PriceHistory_vegetableId_changedAt_idx" ON "PriceHistory"("vegetableId", "changedAt");

-- CreateIndex
CREATE INDEX "PriceHistory_changedAt_idx" ON "PriceHistory"("changedAt");

-- CreateIndex
CREATE INDEX "ReportTemplate_type_idx" ON "ReportTemplate"("type");

-- CreateIndex
CREATE INDEX "ReportTemplate_userId_idx" ON "ReportTemplate"("userId");

-- CreateIndex
CREATE INDEX "Garden_ownerId_idx" ON "Garden"("ownerId");

-- CreateIndex
CREATE INDEX "Garden_createdAt_idx" ON "Garden"("createdAt");

-- CreateIndex
CREATE INDEX "SensorData_sensorId_time_idx" ON "SensorData"("sensorId", "time");

-- CreateIndex
CREATE INDEX "SensorData_time_idx" ON "SensorData"("time");

-- CreateIndex
CREATE INDEX "Vegetable_category_idx" ON "Vegetable"("category");

-- CreateIndex
CREATE INDEX "Vegetable_createdAt_idx" ON "Vegetable"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_vegetableId_fkey" FOREIGN KEY ("vegetableId") REFERENCES "Vegetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
