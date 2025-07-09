import { Prisma, ElectionCode as EC } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'

export const districtColumns = Object.values(
  Prisma.DistrictScalarFieldEnum,
) as (keyof typeof Prisma.DistrictScalarFieldEnum)[]

export const projectedTurnoutColumns = Object.values(
  Prisma.ProjectedTurnoutScalarFieldEnum,
) as (keyof typeof Prisma.ProjectedTurnoutScalarFieldEnum)[]

const ElectionCode = z.nativeEnum(EC)

const getDistrictTypesSchema = z.object({
  state: z
    .preprocess(toUpper, z.string())
    .refine((val) => {
      if (!val) return true
      return STATE_CODES.includes(val)
    }, 'Invalid state code')
    .optional(),
  electionYear: z.coerce.number().int().optional(),
  electionCode: ElectionCode.optional(),
  excludeInvalid: z.coerce.boolean().optional(),
})

const getDistrictsSchema = z.object({
  state: z
    .preprocess(toUpper, z.string())
    .refine((val) => {
      if (!val) return true
      return STATE_CODES.includes(val)
    }, 'Invalid state code')
    .optional(),
  L2DistrictType: z.string().optional(),
  L2DistrictName: z.string().optional(),
  electionYear: z.coerce.number().int().optional(),
  excludeInvalid: z.coerce.boolean().optional(),
  electionCode: ElectionCode.optional(),
  districtColumns: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const columns = val.split(',').map((col) => col.trim())
        return columns.every((col) =>
          districtColumns.includes(
            col as keyof typeof Prisma.DistrictScalarFieldEnum,
          ),
        )
      },
      {
        message: `Invalid district column provided. Allowed columns are: ${districtColumns.join(', ')}`,
      },
    ),
  projectedTurnoutColumns: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const columns = val.split(',').map((col) => col.trim())
        return columns.every((col) =>
          projectedTurnoutColumns.includes(
            col as keyof typeof Prisma.ProjectedTurnoutScalarFieldEnum,
          ),
        )
      },
      {
        message: `Invalid projectedTurnout column provided. Allowed columns are ${projectedTurnoutColumns}`,
      },
    ),
})

export class GetDistrictTypesDTO extends createZodDto(getDistrictTypesSchema) {}
export class GetDistrictsDTO extends createZodDto(getDistrictsSchema) {}
