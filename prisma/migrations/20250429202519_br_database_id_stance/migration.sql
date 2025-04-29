/*
  Warnings:

  - Added the required column `br_database_id` to the `Stance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stance" ADD COLUMN     "br_database_id" INTEGER NOT NULL;
