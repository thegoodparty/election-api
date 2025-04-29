/*
  Warnings:

  - The primary key for the `Candidacy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `br_database_id` to the `Candidacy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Candidacy` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Candidacy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Candidacy" DROP CONSTRAINT "Candidacy_pkey",
ADD COLUMN     "br_database_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Candidacy_pkey" PRIMARY KEY ("id");
