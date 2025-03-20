/*
  Warnings:

  - You are about to drop the column `election_day` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `location_name` on the `Race` table. All the data in the column will be lost.
  - Made the column `state` on table `Place` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Race` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state_slug` on table `Race` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Place" ALTER COLUMN "state" SET NOT NULL;

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "election_day",
DROP COLUMN "location_name",
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "state_slug" SET NOT NULL;
