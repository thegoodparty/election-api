import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const getVoterIssuesQuerySchema = z
  .object({
    districtId: z.string().uuid().optional(),
    ballotReadyPositionId: z.string().min(1).optional(),
    state: z.string().length(2).optional(),
    city: z.string().min(1).optional(),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  })
  .refine(
    (v) =>
      Boolean(v.districtId || v.ballotReadyPositionId || v.state || v.city),
    {
      message:
        'At least one of districtId, ballotReadyPositionId, state, or city is required',
    },
  )

export class GetVoterIssuesQueryDTO extends createZodDto(
  getVoterIssuesQuerySchema,
) {}

export type VoterIssue = {
  label: string
  score: number
  priority: 'high' | 'medium' | 'low'
}
