/*
  Warnings:

  - You are about to drop the column `l2_district_name` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `l2_district_type` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Projected_Turnout` table. All the data in the column will be lost.
  - Added the required column `district_id` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Projected_Turnout_state_l2_district_type_l2_district_name_e_idx";

-- AlterTable
ALTER TABLE "Projected_Turnout" DROP COLUMN "l2_district_name",
DROP COLUMN "l2_district_type",
DROP COLUMN "state",
ADD COLUMN     "district_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "District" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "l2_district_type" TEXT NOT NULL,
    "l2_district_name" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_state_l2_district_type_l2_district_name_key" ON "District"("state", "l2_district_type", "l2_district_name");

-- CreateIndex
CREATE INDEX "Projected_Turnout_district_id_election_year_idx" ON "Projected_Turnout"("district_id", "election_year");

-- AddForeignKey
ALTER TABLE "Projected_Turnout" ADD CONSTRAINT "Projected_Turnout_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
