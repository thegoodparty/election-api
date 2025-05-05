/*
  Warnings:

  - Made the column `position_name` on table `Candidacy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Candidacy" ALTER COLUMN "position_name" SET NOT NULL;
