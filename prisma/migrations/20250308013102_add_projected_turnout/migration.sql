-- CreateEnum
CREATE TYPE "ElectionCode" AS ENUM ('EP', 'EG', 'EPP', 'ECP', 'ECG', 'EL', 'ES', 'ER', 'EPD');

-- CreateTable
CREATE TABLE "projected_turnout" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "office_type" TEXT NOT NULL,
    "office_name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "electionCode" "ElectionCode" NOT NULL,
    "turnout_estimate" INTEGER,
    "inference_date" TIMESTAMP(3) NOT NULL,
    "model_version" TEXT,

    CONSTRAINT "projected_turnout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projected_turnout_state_office_type_office_name_inference_d_key" ON "projected_turnout"("state", "office_type", "office_name", "inference_date");
