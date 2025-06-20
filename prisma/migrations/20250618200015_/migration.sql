/*
  Warnings:

  - The values [EP,EG,EPP,ECP,ECG,EL,ES,ER,EPD] on the enum `ElectionCode` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `brPositionId` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `inference_date` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Projected_Turnout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[br_position_id]` on the table `Projected_Turnout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `br_position_id` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_year` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inference_at` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ElectionCode_new" AS ENUM ('General', 'LocalOrMunicipal', 'ConsolidatedGeneral');
ALTER TABLE "Projected_Turnout" ALTER COLUMN "election_code" TYPE "ElectionCode_new" USING ("election_code"::text::"ElectionCode_new");
ALTER TYPE "ElectionCode" RENAME TO "ElectionCode_old";
ALTER TYPE "ElectionCode_new" RENAME TO "ElectionCode";
DROP TYPE "ElectionCode_old";
COMMIT;

-- DropIndex
DROP INDEX "Projected_Turnout_brPositionId_key";

-- AlterTable
ALTER TABLE "Projected_Turnout" DROP COLUMN "brPositionId",
DROP COLUMN "inference_date",
DROP COLUMN "year",
ADD COLUMN     "br_position_id" TEXT NOT NULL,
ADD COLUMN     "election_year" INTEGER NOT NULL,
ADD COLUMN     "inference_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Projected_Turnout_br_position_id_key" ON "Projected_Turnout"("br_position_id");
