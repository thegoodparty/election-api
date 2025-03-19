/*
  Warnings:

  - You are about to drop the column `countyId` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipalityId` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `race_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the `county` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `municipality` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_countyId_fkey";

-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_municipalityId_fkey";

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_race_id_fkey";

-- DropForeignKey
ALTER TABLE "municipality" DROP CONSTRAINT "municipality_county_id_fkey";

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "countyId",
DROP COLUMN "municipalityId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "placeId" UUID,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "race_id";

-- DropTable
DROP TABLE "county";

-- DropTable
DROP TABLE "municipality";

-- DropEnum
DROP TYPE "MunicipalityType";

-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "br_database_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "geoid" TEXT NOT NULL,
    "mtfcc" TEXT,
    "state" CHAR(2),
    "city_largest" TEXT,
    "county_name" TEXT,
    "popluation" INTEGER,
    "density" DOUBLE PRECISION,
    "income_household_median" INTEGER,
    "unemployment_rate" DOUBLE PRECISION,
    "home_value" INTEGER,
    "upperId" UUID,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_upperId_fkey" FOREIGN KEY ("upperId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
