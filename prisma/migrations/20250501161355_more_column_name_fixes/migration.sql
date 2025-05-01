/*
  Warnings:

  - You are about to drop the column `candidacyId` on the `Stance` table. All the data in the column will be lost.
  - You are about to drop the column `issueId` on the `Stance` table. All the data in the column will be lost.
  - You are about to drop the column `stanceLocale` on the `Stance` table. All the data in the column will be lost.
  - You are about to drop the column `stanceReferenceUrl` on the `Stance` table. All the data in the column will be lost.
  - You are about to drop the column `stanceStatement` on the `Stance` table. All the data in the column will be lost.
  - Added the required column `issue_id` to the `Stance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stance_locale` to the `Stance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stance_reference_url` to the `Stance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stance_statement` to the `Stance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stance" DROP CONSTRAINT "Stance_candidacyId_fkey";

-- DropForeignKey
ALTER TABLE "Stance" DROP CONSTRAINT "Stance_issueId_fkey";

-- AlterTable
ALTER TABLE "Stance" DROP COLUMN "candidacyId",
DROP COLUMN "issueId",
DROP COLUMN "stanceLocale",
DROP COLUMN "stanceReferenceUrl",
DROP COLUMN "stanceStatement",
ADD COLUMN     "candidacy_id" UUID,
ADD COLUMN     "issue_id" UUID NOT NULL,
ADD COLUMN     "stance_locale" TEXT NOT NULL,
ADD COLUMN     "stance_reference_url" TEXT NOT NULL,
ADD COLUMN     "stance_statement" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stance" ADD CONSTRAINT "Stance_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stance" ADD CONSTRAINT "Stance_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "Candidacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
