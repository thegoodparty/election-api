-- Widen Candidacy and Race for the candidate-onboarding flow (DATA-1922).
-- All new columns are nullable; the dbt writer (write__election_api_db.py) is
-- already updated to populate them on the next mart load. No backfill required.

-- AlterTable: Candidacy
ALTER TABLE "Candidacy"
  ADD COLUMN     "gp_candidate_id" TEXT,
  ADD COLUMN     "is_incumbent" BOOLEAN;

-- AlterTable: Race
ALTER TABLE "Race"
  ADD COLUMN     "number_of_seats" INTEGER,
  ADD COLUMN     "win_number" INTEGER,
  ADD COLUMN     "is_partisan" BOOLEAN,
  ADD COLUMN     "office_type" TEXT,
  ADD COLUMN     "official_office_name" TEXT,
  ADD COLUMN     "position_id" UUID;

-- CreateIndex
CREATE INDEX "Race_position_id_idx" ON "Race"("position_id");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
