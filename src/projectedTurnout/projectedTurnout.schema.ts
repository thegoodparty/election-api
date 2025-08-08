import { STATE_CODES } from 'src/shared/constants/states'
import { z } from 'zod'
import { ElectionCode } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'

const ElectionEnum = z.nativeEnum(ElectionCode)

const projectedTurnoutUniqueSchema = z
  .object({
    state: z
      .string()
      .transform((v) => v.toUpperCase())
      .refine((v) => STATE_CODES.includes(v), 'Invalid state code'),
    L2DistrictType: z.string(),
    L2DistrictName: z.string(),
    electionYear: z.preprocess((val) => Number(val), z.number()).optional(),
    electionDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Invalid date string',
    }),
    electionCode: ElectionEnum.optional(),
  })
  .refine((data) => data.electionCode || data.electionDate, {
    message: 'Either electionCode or electionDate is required',
    path: ['electionCode'],
  })

const projectedTurnoutManyQuerySchema = z
  .object({
    state: z
      .string()
      .transform((v) => v.toUpperCase())
      .refine((v) => STATE_CODES.includes(v), 'Invalid state code'),
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

export class ProjectedTurnoutUniqueDTO extends createZodDto(
  projectedTurnoutUniqueSchema,
) {}

export class ProjectedTurnoutManyQueryDTO extends createZodDto(
  projectedTurnoutManyQuerySchema,
) {}
