import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const candidacyColumns = Object.values(
  Prisma.CandidacyScalarFieldEnum,
) as (keyof typeof Prisma.CandidacyScalarFieldEnum)[]

const candidacyFilterSchema = z
  .object({
    state: z
      .preprocess(toUpper, z.string())
      .optional()
      .refine((val) => {
        if (!val) return true
        return STATE_CODES.includes(val)
      }, 'Invalid state code'),
    slug: z.string().optional(),
    raceSlug: z.string().optional(),
    includeStances: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
    columns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            candidacyColumns.includes(
              col as keyof typeof Prisma.CandidacyScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid race column provided. Allowed columns are: ${candidacyColumns.join(', ')}`,
        },
      ),
  })
  .strict()

export class CandidacyFilterDto extends createZodDto(candidacyFilterSchema) {}
