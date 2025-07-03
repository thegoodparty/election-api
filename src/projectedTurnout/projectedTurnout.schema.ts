import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'
import { ElectionCode } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'

const ElectionEnum = z.nativeEnum(ElectionCode)

const projectedTurnoutQuerySchema = z.object({
  state: z.preprocess(toUpper, z.string()).refine((val) => {
    if (!val) return true
    return STATE_CODES.includes(val)
  }, 'Invalid state code'),
  L2DistrictType: z.string(),
  L2DistrictName: z.string(),
  electionYear: z.preprocess((val) => Number(val), z.number()).optional(),
  electionCode: ElectionEnum.optional(),
})

export class ProjectedTurnoutQueryDTO extends createZodDto(
  projectedTurnoutQuerySchema,
) {}
