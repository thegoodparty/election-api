/*
  Warnings:

  - You are about to drop the column `education` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `militaryService` on the `Candidacy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Candidacy" DROP COLUMN "education",
DROP COLUMN "militaryService";
