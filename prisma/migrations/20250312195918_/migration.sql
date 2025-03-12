/*
  Warnings:

  - You are about to drop the column `candidate_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `election_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the `candidacy_party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `election` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `endorsement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mtfcc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `office_holder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `office_holder_party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `person` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `place` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `place_position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `position_election_frequency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `position_issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `race` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `race_election` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `url` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PositionLevel" AS ENUM ('CITY', 'COUNTY', 'FEDERAL', 'LOCAL', 'REGIONAL', 'STATE', 'TOWNSHIP');

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_election_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_position_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_race_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_party" DROP CONSTRAINT "candidacy_party_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_party" DROP CONSTRAINT "candidacy_party_party_id_fkey";

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_office_holder_id_fkey";

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_person_id_fkey";

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_place_id_fkey";

-- DropForeignKey
ALTER TABLE "endorsement" DROP CONSTRAINT "endorsement_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "endorsement" DROP CONSTRAINT "endorsement_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "issue" DROP CONSTRAINT "issue_parent_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "office_holder" DROP CONSTRAINT "office_holder_person_id_fkey";

-- DropForeignKey
ALTER TABLE "office_holder" DROP CONSTRAINT "office_holder_position_id_fkey";

-- DropForeignKey
ALTER TABLE "office_holder_party" DROP CONSTRAINT "office_holder_party_office_holder_id_fkey";

-- DropForeignKey
ALTER TABLE "office_holder_party" DROP CONSTRAINT "office_holder_party_party_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "place_position" DROP CONSTRAINT "place_position_place_id_fkey";

-- DropForeignKey
ALTER TABLE "place_position" DROP CONSTRAINT "place_position_position_id_fkey";

-- DropForeignKey
ALTER TABLE "position_election_frequency" DROP CONSTRAINT "position_election_frequency_position_id_fkey";

-- DropForeignKey
ALTER TABLE "position_issue" DROP CONSTRAINT "position_issue_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "position_issue" DROP CONSTRAINT "position_issue_position_id_fkey";

-- DropForeignKey
ALTER TABLE "race" DROP CONSTRAINT "race_county_id_fkey";

-- DropForeignKey
ALTER TABLE "race" DROP CONSTRAINT "race_municipality_id_fkey";

-- DropForeignKey
ALTER TABLE "race" DROP CONSTRAINT "race_position_id_fkey";

-- DropForeignKey
ALTER TABLE "race_election" DROP CONSTRAINT "race_election_election_id_fkey";

-- DropForeignKey
ALTER TABLE "race_election" DROP CONSTRAINT "race_election_race_id_fkey";

-- DropForeignKey
ALTER TABLE "stance" DROP CONSTRAINT "stance_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "stance" DROP CONSTRAINT "stance_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "url" DROP CONSTRAINT "url_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "url" DROP CONSTRAINT "url_place_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "candidate_id",
DROP COLUMN "election_id",
DROP COLUMN "position_id";

-- DropTable
DROP TABLE "candidacy_party";

-- DropTable
DROP TABLE "contact";

-- DropTable
DROP TABLE "election";

-- DropTable
DROP TABLE "endorsement";

-- DropTable
DROP TABLE "issue";

-- DropTable
DROP TABLE "mtfcc";

-- DropTable
DROP TABLE "office_holder";

-- DropTable
DROP TABLE "office_holder_party";

-- DropTable
DROP TABLE "organization";

-- DropTable
DROP TABLE "party";

-- DropTable
DROP TABLE "person";

-- DropTable
DROP TABLE "place";

-- DropTable
DROP TABLE "place_position";

-- DropTable
DROP TABLE "position";

-- DropTable
DROP TABLE "position_election_frequency";

-- DropTable
DROP TABLE "position_issue";

-- DropTable
DROP TABLE "race";

-- DropTable
DROP TABLE "race_election";

-- DropTable
DROP TABLE "stance";

-- DropTable
DROP TABLE "url";

-- DropEnum
DROP TYPE "endorsement_status_type_field";

-- DropEnum
DROP TYPE "positionlevel";

-- DropEnum
DROP TYPE "runningmate";

-- DropEnum
DROP TYPE "sentiment";

-- CreateTable
CREATE TABLE "Race" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "position_level" "PositionLevel" NOT NULL,
    "election_date" TIMESTAMP(3) NOT NULL,
    "election_day" TEXT NOT NULL,
    "position_slug" TEXT NOT NULL,
    "normalized_position_name" TEXT,
    "position_name" TEXT,
    "position_description" TEXT,
    "filing_office_address" TEXT,
    "filing_phone_number" TEXT,
    "paperwork_instructions" TEXT,
    "filing_requirements" TEXT,
    "is_runoff" BOOLEAN,
    "is_primary" BOOLEAN,
    "partisan_type" TEXT,
    "location_name" TEXT,
    "filing_date_start" TEXT,
    "filing_date_end" TEXT,
    "employment_type" TEXT,
    "eligibility_requirements" TEXT,
    "salary" TEXT,
    "municipality_popluation" INTEGER,
    "municipality_density" DOUBLE PRECISION,
    "municipality_income_household_median" INTEGER,
    "municipality_unemployment_rate" DOUBLE PRECISION,
    "municipality_home_value" INTEGER,
    "city_largest" TEXT,
    "county_population" INTEGER,
    "county_density" DOUBLE PRECISION,
    "county_income_household_median" INTEGER,
    "county_unemployment_rate" DOUBLE PRECISION,
    "county_home_value" INTEGER,
    "state" TEXT,
    "county_name" TEXT,
    "municipality_name" TEXT,
    "frequency" INTEGER[],

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
