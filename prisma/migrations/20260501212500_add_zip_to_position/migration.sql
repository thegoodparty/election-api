-- CreateTable
CREATE TABLE "Zip_To_Position" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "position_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "br_database_id" INTEGER NOT NULL,
    "zip_code" TEXT,
    "election_year" INTEGER NOT NULL,
    "election_date" DATE NOT NULL,
    "display_office_level" TEXT NOT NULL,
    "office_type" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "Zip_To_Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Zip_To_Position_zip_code_idx" ON "Zip_To_Position"("zip_code");

-- CreateIndex
CREATE INDEX "Zip_To_Position_position_id_idx" ON "Zip_To_Position"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "Zip_To_Position_zip_code_position_id_election_date_key" ON "Zip_To_Position"("zip_code", "position_id", "election_date");

-- AddForeignKey
ALTER TABLE "Zip_To_Position" ADD CONSTRAINT "Zip_To_Position_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
