-- CreateTable
CREATE TABLE "DistrictTopIssue" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "district_id" UUID NOT NULL,
    "issue" TEXT NOT NULL,
    "issue_label" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "issue_rank" INTEGER NOT NULL,

    CONSTRAINT "DistrictTopIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DistrictTopIssue_district_id_issue_key" ON "DistrictTopIssue"("district_id", "issue");

-- AddForeignKey
ALTER TABLE "DistrictTopIssue" ADD CONSTRAINT "DistrictTopIssue_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
