-- Drop gp_candidate_id from Candidacy (DATA-1922 follow-up).
-- The column was added by 20260518180000_widen_race_candidacy_for_onboarding
-- but pulled from scope before any consumer started using it. The dbt mart
-- still resolves gp_candidate_id internally to look up is_incumbent but no
-- longer writes it to Postgres.
--
-- IF EXISTS guards against the case where the prior migration has not yet
-- been deployed to a given environment (the column never got created).

ALTER TABLE "Candidacy" DROP COLUMN IF EXISTS "gp_candidate_id";
