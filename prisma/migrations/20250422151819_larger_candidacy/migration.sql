/*
  Warnings:

  - You are about to drop the `candidacy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "candidacy";

-- CreateTable
CREATE TABLE "Candidacy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "image" TEXT,
    "about" TEXT,
    "urls" TEXT[],
    "p2vData" JSONB,
    "projectedTurnout" INTEGER,
    "republicans" INTEGER,
    "democrats" INTEGER,
    "independents" INTEGER,
    "totalRegisteredVoters" INTEGER,
    "topIssues" JSONB,
    "email" TEXT,
    "pastExperience" TEXT,
    "previouslyInOffice" BOOLEAN,
    "priorRoles" TEXT,
    "electionFrequency" TEXT,
    "salary" INTEGER,
    "normalizedPositionName" TEXT,
    "positionDescription" TEXT,
    "education" TEXT,
    "militaryService" TEXT,

    CONSTRAINT "Candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidacy_slug_key" ON "Candidacy"("slug");
