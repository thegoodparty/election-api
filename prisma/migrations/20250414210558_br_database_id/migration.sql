/*
  Warnings:

  - You are about to drop the column `br_position_database_id` on the `Place` table. All the data in the column will be lost.
  - Added the required column `br_database_id` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "br_position_database_id",
ADD COLUMN     "br_database_id" INTEGER NOT NULL;
