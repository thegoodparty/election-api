-- CreateEnum
CREATE TYPE "sentiment" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "endorsement_status_type_field" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "contact" ADD COLUMN     "place_id" INTEGER;

-- CreateTable
CREATE TABLE "endorsement" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "endorser" TEXT,
    "recommendation" "sentiment",
    "status" "endorsement_status_type_field" NOT NULL,
    "organization_id" INTEGER,
    "candidacy_id" INTEGER,

    CONSTRAINT "endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "logo_url" TEXT,
    "state" TEXT,
    "retired_at" TIMESTAMP(3),
    "parent_id" INTEGER,
    "issue_id" INTEGER,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "geo_id" TEXT,
    "mtfcc" TEXT,
    "timezone" TEXT,
    "primary_type" TEXT,
    "can_vote_in_primary_when_18_by_general" BOOLEAN,
    "dissolved" BOOLEAN NOT NULL DEFAULT false,
    "has_vote_by_mail" BOOLEAN NOT NULL,
    "is_printing_enabled" BOOLEAN NOT NULL,
    "is_receiver_of_vote_by_mail_requests" BOOLEAN NOT NULL,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_position" (
    "id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,

    CONSTRAINT "place_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organization_id" INTEGER,
    "place_id" INTEGER,

    CONSTRAINT "url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "place_position_place_id_position_id_key" ON "place_position"("place_id", "position_id");

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsement" ADD CONSTRAINT "endorsement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsement" ADD CONSTRAINT "endorsement_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_position" ADD CONSTRAINT "place_position_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_position" ADD CONSTRAINT "place_position_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
