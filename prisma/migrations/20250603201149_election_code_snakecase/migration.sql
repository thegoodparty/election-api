/*
  Warnings:

  - You are about to drop the column `electionCode` on the `Projected_Turnout` table. All the data in the column will be lost.
  - Added the required column `election_code` to the `Projected_Turnout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Projected_Turnout" DROP COLUMN "electionCode",
ADD COLUMN     "election_code" "ElectionCode" NOT NULL;
