/*
  Warnings:

  - Made the column `position_name` on table `Candidacy` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `position_geoid` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidacy" ALTER COLUMN "position_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "position_geoid" TEXT NOT NULL;
