/*
  Warnings:

  - You are about to drop the column `data` on the `county` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `municipality` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "county" DROP COLUMN "data";

-- AlterTable
ALTER TABLE "municipality" DROP COLUMN "data";
