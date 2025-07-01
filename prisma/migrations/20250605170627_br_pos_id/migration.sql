/*
  Warnings:

  - A unique constraint covering the columns `[brPositionId]` on the table `Projected_Turnout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brPositionId` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Projected_Turnout_geoid_key";

-- AlterTable
ALTER TABLE "Projected_Turnout" ADD COLUMN     "brPositionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Projected_Turnout_brPositionId_key" ON "Projected_Turnout"("brPositionId");
