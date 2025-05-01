/*
  Warnings:

  - You are about to drop the column `city` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `electionFrequency` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `normalizedPositionName` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `positionDescription` on the `Candidacy` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `Candidacy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Candidacy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidacy" DROP COLUMN "city",
DROP COLUMN "electionFrequency",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "normalizedPositionName",
DROP COLUMN "positionDescription",
ADD COLUMN     "election_frequency" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "normalized_position_name" TEXT,
ADD COLUMN     "place_name" TEXT,
ADD COLUMN     "position_description" TEXT;
