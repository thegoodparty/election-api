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

const projectedTurnoutManyQuerySchema = z
  .object({
    state: z.preprocess(toUpper, z.string()).refine((val) => {
      if (!val) return true
      return STATE_CODES.includes(val)
    }, 'Invalid state code'),
    L2DistrictType: z.string().optional(),
    L2DistrictName: z.string().optional(),
    electionYear: z.preprocess((val) => Number(val), z.number()).optional(),
    electionCode: ElectionEnum.optional(),
    includeDistrict: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
  })
  .refine(
    (data) =>
      data.state !== undefined ||
      data.L2DistrictType !== undefined ||
      data.L2DistrictName !== undefined ||
      data.electionYear !== undefined ||
      data.electionCode !== undefined,
    {
      message:
        'Provide at least one of L2DistrictType, L2DistrictName, electionYear, or electionCode',
    },
  )

export class ProjectedTurnoutQueryDTO extends createZodDto(
  projectedTurnoutQuerySchema,
) {}

export class ProjectedTurnoutManyQueryDTO extends createZodDto(
  projectedTurnoutManyQuerySchema,
) {}
