/*
  Warnings:

  - You are about to drop the column `L2_office_name` on the `Projected_Turnout` table. All the data in the column will be lost.
  - You are about to drop the column `L2_office_type` on the `Projected_Turnout` table. All the data in the column will be lost.
  - Added the required column `l2_office_name` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `l2_office_type` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Projected_Turnout" DROP COLUMN "L2_office_name",
DROP COLUMN "L2_office_type",
ADD COLUMN     "l2_office_name" TEXT NOT NULL,
ADD COLUMN     "l2_office_type" TEXT NOT NULL;
