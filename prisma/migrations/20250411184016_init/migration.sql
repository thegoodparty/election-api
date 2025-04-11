-- CreateEnum
CREATE TYPE "election_result" AS ENUM ('WON', 'LOST', 'RUNOFF');

-- CreateEnum
CREATE TYPE "ElectionCode" AS ENUM ('EP', 'EG', 'EPP', 'ECP', 'ECG', 'EL', 'ES', 'ER', 'EPD');

-- CreateEnum
CREATE TYPE "PositionLevel" AS ENUM ('CITY', 'COUNTY', 'FEDERAL', 'LOCAL', 'REGIONAL', 'STATE', 'TOWNSHIP');

-- CreateTable
CREATE TABLE "candidacy" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_certified" BOOLEAN NOT NULL,
    "is_hidden" BOOLEAN NOT NULL,
    "withdrawn" BOOLEAN NOT NULL,
    "result" "election_result",

    CONSTRAINT "candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "br_position_database_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "geoid" TEXT NOT NULL,
    "mtfcc" TEXT,
    "state" CHAR(2) NOT NULL,
    "city_largest" TEXT,
    "county_name" TEXT,
    "population" INTEGER,
    "density" DOUBLE PRECISION,
    "income_household_median" INTEGER,
    "unemployment_rate" DOUBLE PRECISION,
    "home_value" INTEGER,
    "parent_id" UUID,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projected_turnout" (
    "id" UUID NOT NULL,
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

-- CreateTable
CREATE TABLE "Race" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "election_date" TIMESTAMP(3) NOT NULL,
    "position_slug" TEXT NOT NULL,
    "state_slug" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "position_level" "PositionLevel" NOT NULL,
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
    "filing_date_start" TIMESTAMP(3),
    "filing_date_end" TIMESTAMP(3),
    "employment_type" TEXT,
    "eligibility_requirements" TEXT,
    "salary" TEXT,
    "sub_area_name" TEXT,
    "sub_area_value" TEXT,
    "frequency" INTEGER[],
    "placeId" UUID,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projected_turnout_state_office_type_office_name_year_electi_key" ON "projected_turnout"("state", "office_type", "office_name", "year", "electionCode");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
