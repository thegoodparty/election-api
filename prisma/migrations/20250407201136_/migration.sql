/*
  Warnings:

  - You are about to drop the column `br_database_id` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `upperId` on the `Place` table. All the data in the column will be lost.
  - The `filing_date_start` column on the `Race` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `filing_date_end` column on the `Race` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `br_position_database_id` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_upperId_fkey";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "br_database_id",
DROP COLUMN "upperId",
ADD COLUMN     "br_position_database_id" INTEGER NOT NULL,
ADD COLUMN     "parentId" UUID;

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "filing_date_start",
ADD COLUMN     "filing_date_start" TIMESTAMP(3),
DROP COLUMN "filing_date_end",
ADD COLUMN     "filing_date_end" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
