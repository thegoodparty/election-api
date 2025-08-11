/*
  Warnings:

  - A unique constraint covering the columns `[br_position_id]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Position_br_position_id_key" ON "Position"("br_position_id");
