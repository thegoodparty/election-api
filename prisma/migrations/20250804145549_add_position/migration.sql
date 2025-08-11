-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "br_database_id" TEXT NOT NULL,
    "br_position_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district_id" UUID NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_district_id_key" ON "Position"("district_id");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
