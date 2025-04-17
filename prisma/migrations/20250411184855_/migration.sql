/*
  Warnings:

  - You are about to drop the column `parentId` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `popluation` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Race` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_placeId_fkey";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "parentId",
DROP COLUMN "popluation",
ADD COLUMN     "parent_id" UUID,
ADD COLUMN     "population" INTEGER;

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "placeId",
ADD COLUMN     "place_id" UUID;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
