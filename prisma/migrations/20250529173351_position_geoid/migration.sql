/*
  Warnings:

  - Added the required column `position_geoid` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "position_geoid" TEXT NOT NULL;
