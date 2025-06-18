import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'
import { ElectionCode } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'

const ElectionEnum = z.nativeEnum(ElectionCode)

const projectedTurnoutPostSchema = z.object({
  brPositionDatabaseId: z.string(),
  geoid: z.string(),
  state: z.preprocess(toUpper, z.string()).refine((val) => {
    if (!val) return true
    return STATE_CODES.includes(val)
  }, 'Invalid state code'),
  L2DistrictType: z.string(),
  L2DistrictName: z.string(),

  // Numbers
  electionYear: z.preprocess((val) => Number(val), z.number()),
  projectedTurnout: z.preprocess((val) => Number(val), z.number()),

  inferenceAt: z.preprocess((val) => {
    const date = new Date(val as string)
    return isNaN(date.getTime()) ? undefined : date
  }, z.date()),
  electionCode: ElectionEnum,
  modelVersion: z.string(),
})

export class ProjectedTurnoutPostDTO extends createZodDto(
  projectedTurnoutPostSchema,
) {}
