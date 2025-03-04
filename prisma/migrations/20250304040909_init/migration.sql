-- CreateEnum
CREATE TYPE "election_result" AS ENUM ('WON', 'LOST', 'RUNOFF');

-- CreateEnum
CREATE TYPE "positionlevel" AS ENUM ('FEDERAL', 'STATE', 'COUNTY', 'MUNICIPAL', 'SMALL_TOWN', 'SCHOOL_BOARD', 'SPECIAL_DISTRICT');

-- CreateEnum
CREATE TYPE "runningmate" AS ENUM ('PRIMARY', 'GENERAL');

-- CreateTable
CREATE TABLE "candidacy" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_certified" BOOLEAN NOT NULL,
    "is_hidden" BOOLEAN NOT NULL,
    "withdrawn" BOOLEAN NOT NULL,
    "result" "election_result",
    "candidate_id" INTEGER NOT NULL,
    "election_id" INTEGER NOT NULL,
    "race_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,

    CONSTRAINT "candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidacy_party" (
    "id" SERIAL NOT NULL,
    "candidacy_id" INTEGER NOT NULL,
    "party_id" INTEGER NOT NULL,

    CONSTRAINT "candidacy_party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "fax" TEXT,
    "phone" TEXT,
    "type" TEXT,
    "person_id" INTEGER,
    "office_holder_id" INTEGER,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
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
CREATE TABLE "issue" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "name" TEXT NOT NULL,
    "expanded_text" TEXT NOT NULL,
    "key" TEXT,
    "plugin_enabled" BOOLEAN,
    "response_type" TEXT,
    "row_order" INTEGER,
    "parent_issue_id" INTEGER,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mtfcc" (
    "id" SERIAL NOT NULL,
    "databaseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mtfcc" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "mtfcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_holder" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
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
    "position_id" INTEGER NOT NULL,
    "person_id" INTEGER,

    CONSTRAINT "office_holder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_holder_party" (
    "id" SERIAL NOT NULL,
    "office_holder_id" INTEGER NOT NULL,
    "party_id" INTEGER NOT NULL,

    CONSTRAINT "office_holder_party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
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
CREATE TABLE "position" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
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
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "reference_year" INTEGER NOT NULL,
    "frequency" INTEGER[],
    "seats" INTEGER[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "position_id" INTEGER NOT NULL,

    CONSTRAINT "position_election_frequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_issue" (
    "id" SERIAL NOT NULL,
    "position_id" INTEGER NOT NULL,
    "issue_id" INTEGER NOT NULL,

    CONSTRAINT "position_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_disabled" BOOLEAN,
    "is_partisan" BOOLEAN,
    "is_primary" BOOLEAN NOT NULL,
    "is_recall" BOOLEAN NOT NULL,
    "is_runoff" BOOLEAN NOT NULL,
    "is_unexpired" BOOLEAN NOT NULL,
    "seats" INTEGER,
    "position_id" INTEGER NOT NULL,

    CONSTRAINT "race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_election" (
    "id" SERIAL NOT NULL,
    "race_id" INTEGER NOT NULL,
    "election_id" INTEGER NOT NULL,

    CONSTRAINT "race_election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stance" (
    "id" SERIAL NOT NULL,
    "database_id" INTEGER,
    "issue_id" INTEGER NOT NULL,
    "locale" TEXT,
    "reference_url" TEXT,
    "statement" TEXT,
    "candidacy_id" INTEGER NOT NULL,

    CONSTRAINT "stance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidacy_party_candidacy_id_party_id_key" ON "candidacy_party"("candidacy_id", "party_id");

-- CreateIndex
CREATE UNIQUE INDEX "office_holder_party_office_holder_id_party_id_key" ON "office_holder_party"("office_holder_id", "party_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_issue_position_id_issue_id_key" ON "position_issue"("position_id", "issue_id");

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
ALTER TABLE "issue" ADD CONSTRAINT "issue_parent_issue_id_fkey" FOREIGN KEY ("parent_issue_id") REFERENCES "issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder" ADD CONSTRAINT "office_holder_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder" ADD CONSTRAINT "office_holder_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder_party" ADD CONSTRAINT "office_holder_party_office_holder_id_fkey" FOREIGN KEY ("office_holder_id") REFERENCES "office_holder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_holder_party" ADD CONSTRAINT "office_holder_party_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_election_frequency" ADD CONSTRAINT "position_election_frequency_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_issue" ADD CONSTRAINT "position_issue_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_issue" ADD CONSTRAINT "position_issue_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race" ADD CONSTRAINT "race_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_election" ADD CONSTRAINT "race_election_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_election" ADD CONSTRAINT "race_election_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stance" ADD CONSTRAINT "stance_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stance" ADD CONSTRAINT "stance_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
