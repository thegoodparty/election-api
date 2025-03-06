/*
  Warnings:

  - The values [APPROVED,REJECTED] on the enum `endorsement_status_type_field` will be removed. If these variants are still used in the database, this will fail.
  - The values [MUNICIPAL,SMALL_TOWN,SCHOOL_BOARD,SPECIAL_DISTRICT] on the enum `positionlevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [POSITIVE,NEGATIVE,NEUTRAL] on the enum `sentiment` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `type` on the `municipality` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MunicipalityType" AS ENUM ('LOCAL', 'CITY', 'TOWN', 'TOWNSHIP', 'VILLAGE');

-- AlterEnum
BEGIN;
CREATE TYPE "endorsement_status_type_field_new" AS ENUM ('ACTIVE', 'NOT_FOUND', 'PENDING');
ALTER TABLE "endorsement" ALTER COLUMN "status" TYPE "endorsement_status_type_field_new" USING ("status"::text::"endorsement_status_type_field_new");
ALTER TYPE "endorsement_status_type_field" RENAME TO "endorsement_status_type_field_old";
ALTER TYPE "endorsement_status_type_field_new" RENAME TO "endorsement_status_type_field";
DROP TYPE "endorsement_status_type_field_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "positionlevel_new" AS ENUM ('CITY', 'COUNTY', 'FEDERAL', 'LOCAL', 'REGIONAL', 'STATE', 'TOWNSHIP');
ALTER TABLE "position" ALTER COLUMN "level" TYPE "positionlevel_new" USING ("level"::text::"positionlevel_new");
ALTER TYPE "positionlevel" RENAME TO "positionlevel_old";
ALTER TYPE "positionlevel_new" RENAME TO "positionlevel";
DROP TYPE "positionlevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "sentiment_new" AS ENUM ('CON', 'PRO');
ALTER TABLE "endorsement" ALTER COLUMN "recommendation" TYPE "sentiment_new" USING ("recommendation"::text::"sentiment_new");
ALTER TYPE "sentiment" RENAME TO "sentiment_old";
ALTER TYPE "sentiment_new" RENAME TO "sentiment";
DROP TYPE "sentiment_old";
COMMIT;

-- AlterTable
ALTER TABLE "municipality" DROP COLUMN "type",
ADD COLUMN     "type" "MunicipalityType" NOT NULL;
