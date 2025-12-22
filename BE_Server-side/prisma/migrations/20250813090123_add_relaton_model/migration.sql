/*
  Warnings:

  - You are about to drop the column `gardenId` on the `SensorData` table. All the data in the column will be lost.
  - You are about to drop the column `humidity` on the `SensorData` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `SensorData` table. All the data in the column will be lost.
  - You are about to drop the column `gardenId` on the `Vegetable` table. All the data in the column will be lost.
  - Added the required column `priceAtSale` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorId` to the `SensorData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SensorData" DROP CONSTRAINT "SensorData_gardenId_fkey";

-- DropForeignKey
ALTER TABLE "Vegetable" DROP CONSTRAINT "Vegetable_gardenId_fkey";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "priceAtSale" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SensorData" DROP COLUMN "gardenId",
DROP COLUMN "humidity",
DROP COLUMN "temperature",
ADD COLUMN     "sensorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vegetable" DROP COLUMN "gardenId";

-- CreateTable
CREATE TABLE "vegetable_garden" (
    "id" SERIAL NOT NULL,
    "vegetableId" INTEGER NOT NULL,
    "gardenId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "vegetable_garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "SensorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "gardenId" INTEGER NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vegetable_garden" ADD CONSTRAINT "vegetable_garden_vegetableId_fkey" FOREIGN KEY ("vegetableId") REFERENCES "Vegetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vegetable_garden" ADD CONSTRAINT "vegetable_garden_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "SensorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorData" ADD CONSTRAINT "SensorData_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
