-- AlterTable
ALTER TABLE "Candidacy" ADD COLUMN     "race_id" UUID;

-- AddForeignKey
ALTER TABLE "Candidacy" ADD CONSTRAINT "Candidacy_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;
