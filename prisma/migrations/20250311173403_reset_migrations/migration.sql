-- CreateEnum
CREATE TYPE "election_result" AS ENUM ('WON', 'LOST', 'RUNOFF');

-- CreateEnum
CREATE TYPE "sentiment" AS ENUM ('CON', 'PRO');

-- CreateEnum
CREATE TYPE "endorsement_status_type_field" AS ENUM ('ACTIVE', 'NOT_FOUND', 'PENDING');

-- CreateEnum
CREATE TYPE "MunicipalityType" AS ENUM ('LOCAL', 'CITY', 'TOWN', 'TOWNSHIP', 'VILLAGE');

-- CreateEnum
CREATE TYPE "positionlevel" AS ENUM ('CITY', 'COUNTY', 'FEDERAL', 'LOCAL', 'REGIONAL', 'STATE', 'TOWNSHIP');

-- CreateEnum
CREATE TYPE "runningmate" AS ENUM ('PRIMARY', 'GENERAL');

-- CreateEnum
CREATE TYPE "ElectionCode" AS ENUM ('EP', 'EG', 'EPP', 'ECP', 'ECG', 'EL', 'ES', 'ER', 'EPD');

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
    "candidate_id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "race_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,

    CONSTRAINT "candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_party" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "candidacy_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,

    CONSTRAINT "candidacy_party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "email" TEXT,
    "fax" TEXT,
    "phone" TEXT,
    "type" TEXT,
    "person_id" UUID,
    "office_holder_id" UUID,
    "place_id" UUID,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "county" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" CHAR(2),

    CONSTRAINT "county_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "default_time_zone" TEXT NOT NULL,
    "election_day" TIMESTAMP(3) NOT NULL,
    "original_election_date" TIMESTAMP(3) NOT NULL,
    "state" TEXT,
    "ballots_sent_out_by" TIMESTAMP(3),
    "candidate_information_published_at" TIMESTAMP(3),

    CONSTRAINT "election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endorsement" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "endorser" TEXT,
    "recommendation" "sentiment",
    "status" "endorsement_status_type_field" NOT NULL,
    "organization_id" UUID,
    "candidacy_id" UUID,

    CONSTRAINT "endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "name" TEXT NOT NULL,
    "expanded_text" TEXT NOT NULL,
    "key" TEXT,
    "plugin_enabled" BOOLEAN,
    "response_type" TEXT,
    "row_order" INTEGER,
    "parent_issue_id" UUID,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mtfcc" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mtfcc" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "mtfcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipality" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MunicipalityType" NOT NULL,
    "state" CHAR(2),
    "county_id" UUID,

    CONSTRAINT "municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_holder" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_appointed" BOOLEAN NOT NULL,
    "is_current" BOOLEAN NOT NULL,
    "is_off_cycle" BOOLEAN NOT NULL,
    "is_vacant" BOOLEAN NOT NULL,
    "office_title" TEXT,
    "end_at" TIMESTAMP(3),
    "start_at" TIMESTAMP(3),
    "total_years_in_office" INTEGER NOT NULL,
    "position_id" UUID NOT NULL,
    "person_id" UUID,

    CONSTRAINT "office_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_holder_party" (
    "id" UUID NOT NULL,
    "office_holder_id" UUID NOT NULL,
    "party_id" UUID NOT NULL,

    CONSTRAINT "office_holder_party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "logo_url" TEXT,
    "state" TEXT,
    "retired_at" TIMESTAMP(3),
    "parent_id" UUID,
    "issue_id" UUID,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "bio_text" TEXT,
    "first_name" TEXT,
    "full_name" TEXT NOT NULL,
    "last_name" TEXT,
    "middle_name" TEXT,
    "nickname" TEXT,
    "suffix" TEXT,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
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
    "id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,

    CONSTRAINT "place_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "appointed" BOOLEAN NOT NULL,
    "description" TEXT,
    "eligibility_requirements" TEXT,
    "employment_type" TEXT,
    "filing_address" TEXT,
    "filing_phone" TEXT,
    "filing_requirements" TEXT,
    "geo_id" TEXT,
    "has_majority_vote_primary" BOOLEAN NOT NULL,
    "has_primary" BOOLEAN,
    "has_ranked_choice_general" BOOLEAN NOT NULL,
    "has_ranked_choice_primary" BOOLEAN NOT NULL,
    "has_unknown_boundaries" BOOLEAN NOT NULL,
    "judicial" BOOLEAN NOT NULL,
    "level" "positionlevel" NOT NULL,
    "maximum_filing_fee" DOUBLE PRECISION,
    "minimum_age" INTEGER,
    "mtfcc" TEXT,
    "must_be_registered_voter" BOOLEAN,
    "must_be_resident" BOOLEAN,
    "must_have_professional_experience" BOOLEAN,
    "name" TEXT NOT NULL,
    "row_order" INTEGER NOT NULL,
    "running_mate_style" "runningmate",
    "salary" TEXT,
    "seats" INTEGER NOT NULL,
    "selections_allowed" INTEGER NOT NULL,
    "staggered_term" BOOLEAN NOT NULL,
    "state" TEXT,
    "sub_area_name" TEXT,
    "sub_area_value" TEXT,
    "tier" INTEGER NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_election_frequency" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "reference_year" INTEGER NOT NULL,
    "frequency" INTEGER[],
    "seats" INTEGER[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "position_id" UUID NOT NULL,

    CONSTRAINT "position_election_frequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_issue" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,

    CONSTRAINT "position_issue_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "race" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_disabled" BOOLEAN,
    "is_partisan" BOOLEAN,
    "is_primary" BOOLEAN NOT NULL,
    "is_recall" BOOLEAN NOT NULL,
    "is_runoff" BOOLEAN NOT NULL,
    "is_unexpired" BOOLEAN NOT NULL,
    "seats" INTEGER,
    "position_id" UUID NOT NULL,
    "county_id" UUID,
    "municipality_id" UUID,

    CONSTRAINT "race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_election" (
    "id" UUID NOT NULL,
    "race_id" UUID NOT NULL,
    "election_id" UUID NOT NULL,

    CONSTRAINT "race_election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stance" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "database_id" INTEGER,
    "issue_id" UUID NOT NULL,
    "locale" TEXT,
    "reference_url" TEXT,
    "statement" TEXT,
    "candidacy_id" UUID NOT NULL,

    CONSTRAINT "stance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url" (
    "id" UUID NOT NULL,
    "br_hash_id" TEXT,
    "br_database_id" INTEGER,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organization_id" UUID,
    "place_id" UUID,

    CONSTRAINT "url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_party_candidacy_id_party_id_key" ON "candidacy_party"("candidacy_id", "party_id");

-- CreateIndex
CREATE UNIQUE INDEX "county_slug_key" ON "county"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "municipality_slug_key" ON "municipality"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "office_holder_party_office_holder_id_party_id_key" ON "office_holder_party"("office_holder_id", "party_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_position_place_id_position_id_key" ON "place_position"("place_id", "position_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_issue_position_id_issue_id_key" ON "position_issue"("position_id", "issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "projected_turnout_state_office_type_office_name_year_electi_key" ON "projected_turnout"("state", "office_type", "office_name", "year", "electionCode");

-- CreateIndex
CREATE UNIQUE INDEX "race_election_race_id_election_id_key" ON "race_election"("race_id", "election_id");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_party" ADD CONSTRAINT "candidacy_party_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_party" ADD CONSTRAINT "candidacy_party_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_office_holder_id_fkey" FOREIGN KEY ("office_holder_id") REFERENCES "office_holder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsement" ADD CONSTRAINT "endorsement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsement" ADD CONSTRAINT "endorsement_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_parent_issue_id_fkey" FOREIGN KEY ("parent_issue_id") REFERENCES "issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipality" ADD CONSTRAINT "municipality_county_id_fkey" FOREIGN KEY ("county_id") REFERENCES "county"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder" ADD CONSTRAINT "office_holder_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder" ADD CONSTRAINT "office_holder_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder_party" ADD CONSTRAINT "office_holder_party_office_holder_id_fkey" FOREIGN KEY ("office_holder_id") REFERENCES "office_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder_party" ADD CONSTRAINT "office_holder_party_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_position" ADD CONSTRAINT "place_position_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_position" ADD CONSTRAINT "place_position_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_election_frequency" ADD CONSTRAINT "position_election_frequency_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_issue" ADD CONSTRAINT "position_issue_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_issue" ADD CONSTRAINT "position_issue_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race" ADD CONSTRAINT "race_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race" ADD CONSTRAINT "race_county_id_fkey" FOREIGN KEY ("county_id") REFERENCES "county"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race" ADD CONSTRAINT "race_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_election" ADD CONSTRAINT "race_election_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_election" ADD CONSTRAINT "race_election_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stance" ADD CONSTRAINT "stance_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stance" ADD CONSTRAINT "stance_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
