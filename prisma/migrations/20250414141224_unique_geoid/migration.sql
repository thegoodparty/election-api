/*
  Warnings:

  - You are about to drop the column `position_slug` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `state_slug` on the `Race` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[geoid]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Race` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Race_position_slug_key";

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "position_slug",
DROP COLUMN "state_slug",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Place_geoid_key" ON "Place"("geoid");

-- CreateIndex
CREATE UNIQUE INDEX "Race_slug_key" ON "Race"("slug");
