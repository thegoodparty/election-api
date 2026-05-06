import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const getVoterIssuesQuerySchema = z.object({
  districtId: z.string().uuid(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
})

export class GetVoterIssuesQueryDTO extends createZodDto(
  getVoterIssuesQuerySchema,
) {}

export type VoterIssue = {
  label: string
  score: number
  priority: 'high' | 'medium' | 'low'
}
