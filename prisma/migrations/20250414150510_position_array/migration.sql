/*
  Warnings:

  - You are about to drop the column `position_name` on the `Race` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Race" DROP COLUMN "position_name",
ADD COLUMN     "position_names" TEXT[];
