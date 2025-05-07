/*
  Warnings:

  - The `election_frequency` column on the `Candidacy` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Candidacy" ALTER COLUMN "salary" SET DATA TYPE TEXT,
DROP COLUMN "election_frequency",
ADD COLUMN     "election_frequency" INTEGER[];
