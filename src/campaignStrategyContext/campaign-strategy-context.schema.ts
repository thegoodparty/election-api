import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Input is the BallotReady race hash (`Race.brHashId`, a base64-encoded
// gid://... value). gp-api stores this on `campaign.details.raceId` for
// every onboarded candidate; pass it through verbatim. User-side fields
// live in the sign-up flow on the caller; the election-api endpoint
// stays purely about election data.
const campaignStrategyContextRequestSchema = z
  .object({
    brHashId: z.string().min(1),
  })
  .strict()

export class CampaignStrategyContextRequestDto extends createZodDto(
  campaignStrategyContextRequestSchema,
) {}

export type CampaignStrategyContextCandidate = {
  gp_candidate_id: string | null
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  website_url: string | null
  party: string | null
  is_incumbent: boolean | null
}

export type CampaignStrategyContextResponse = {
  candidate_count: number
  candidate_office: string | null
  candidates: CampaignStrategyContextCandidate[]
  civics_win_number: number | null
  contacts_needed_estimate: number | null
  general_election_date: string | null
  number_of_seats: number | null
  office_level: string | null
  office_type: string | null
  official_office_name: string | null
  primary_election_date: string | null
  projected_turnout: number | null
  projected_voter_turnout: number | null
  registered_voters: number | null
  registered_voters_with_cellphone: number | null
  registered_voters_with_landline: number | null
  relevant_election_date: string | null
  state: string | null
  win_number_effective: number | null
  win_number_estimate: number | null
}
