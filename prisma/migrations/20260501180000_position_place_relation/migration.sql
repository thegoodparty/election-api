-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "place_id" UUID;

-- CreateIndex
CREATE INDEX "Position_place_id_idx" ON "Position"("place_id");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
