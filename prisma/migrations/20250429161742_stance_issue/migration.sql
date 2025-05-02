/*
  Warnings:

  - You are about to drop the column `democrats` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `independents` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `pastExperience` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `previouslyInOffice` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `priorRoles` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `projectedTurnout` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `republicans` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `topIssues` on the `Candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `totalRegisteredVoters` on the `Candidacy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Candidacy" DROP COLUMN "democrats",
DROP COLUMN "email",
DROP COLUMN "independents",
DROP COLUMN "pastExperience",
DROP COLUMN "previouslyInOffice",
DROP COLUMN "priorRoles",
DROP COLUMN "projectedTurnout",
DROP COLUMN "republicans",
DROP COLUMN "topIssues",
DROP COLUMN "totalRegisteredVoters";

-- CreateTable
CREATE TABLE "Issue" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "br_database_id" INTEGER NOT NULL,
    "expanded_text" TEXT NOT NULL,
    "key" TEXT,
    "name" TEXT NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stance" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stanceLocale" TEXT NOT NULL,
    "stanceReferenceUrl" TEXT NOT NULL,
    "stanceStatement" TEXT NOT NULL,
    "issueId" UUID NOT NULL,
    "candidacyId" UUID,

    CONSTRAINT "Stance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stance" ADD CONSTRAINT "Stance_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stance" ADD CONSTRAINT "Stance_candidacyId_fkey" FOREIGN KEY ("candidacyId") REFERENCES "Candidacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
