/*
  Warnings:

  - You are about to drop the column `br_position_id` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `geoid` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `l2_office_name` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `l2_office_type` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `projected_turnout_id` on the `Race` table. All the data in the column will be lost.
  - Added the required column `l2_district_name` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `l2_district_type` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Race" DROP CONSTRAINT "Race_projected_turnout_id_fkey";

-- DropIndex
DROP INDEX "Projected_Turnout_br_position_id_key";

-- AlterTable
ALTER TABLE "Projected_Turnout" DROP COLUMN "br_position_id",
DROP COLUMN "geoid",
DROP COLUMN "l2_office_name",
DROP COLUMN "l2_office_type",
ADD COLUMN     "l2_district_name" TEXT NOT NULL,
ADD COLUMN     "l2_district_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Race" DROP COLUMN "projected_turnout_id";

-- CreateIndex
CREATE INDEX "Projected_Turnout_state_l2_district_type_l2_district_name_e_idx" ON "Projected_Turnout"("state", "l2_district_type", "l2_district_name", "election_year");
