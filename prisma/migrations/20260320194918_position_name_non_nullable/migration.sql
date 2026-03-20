/*
  Warnings:

  - Made the column `name` on table `Position` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "name" SET NOT NULL;
