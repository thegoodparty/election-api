/*
  Warnings:

  - You are about to drop the `projected_turnout` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "projected_turnout_id" UUID;

-- DropTable
DROP TABLE "projected_turnout";

-- CreateTable
CREATE TABLE "Projected_Turnout" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "geoid" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "L2_office_type" TEXT NOT NULL,
    "L2_office_name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "electionCode" "ElectionCode" NOT NULL,
    "projected_turnout" INTEGER NOT NULL,
    "inference_date" TIMESTAMP(3) NOT NULL,
    "model_version" TEXT NOT NULL,

    CONSTRAINT "Projected_Turnout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Projected_Turnout_geoid_key" ON "Projected_Turnout"("geoid");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_projected_turnout_id_fkey" FOREIGN KEY ("projected_turnout_id") REFERENCES "Projected_Turnout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
