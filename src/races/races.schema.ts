import { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { candidacyColumns } from 'src/candidacies/candidacies.schema'
import { placeColumns } from 'src/places/places.schema'
import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'

export const raceColumns = Object.values(
  Prisma.RaceScalarFieldEnum,
) as (keyof typeof Prisma.RaceScalarFieldEnum)[]

const positionLevelEnum = z.enum([
  'CITY',
  'COUNTY',
  'FEDERAL',
  'LOCAL',
  'REGIONAL',
  'STATE',
  'TOWNSHIP',
])

const raceFilterSchema = z
  .object({
    state: z
      .preprocess(toUpper, z.string())
      .optional()
      .refine((val) => {
        if (!val) return true
        return STATE_CODES.includes(val)
      }, 'Invalid state code'),
    placeSlug: z.string().optional(),
    positionLevel: positionLevelEnum.optional(),
    raceSlug: z.string().optional(),
    electionDateStart: z.string().optional(),
    electionDateEnd: z.string().optional(),
    includePlace: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
    includeCandidacies: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
    isPrimary: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional(),
    ),
    isRunoff: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional(),
    ),
    raceColumns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            raceColumns.includes(
              col as keyof typeof Prisma.RaceScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid race column provided. Allowed columns are: ${raceColumns.join(', ')}`,
        },
      ),
    placeColumns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            placeColumns.includes(
              col as keyof typeof Prisma.PlaceScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid place column provided. Allowed columns are: ${placeColumns.join(', ')}`,
        },
      ),
    candidacyColumns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            placeColumns.includes(
              col as keyof typeof Prisma.PlaceScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid place column provided. Allowed columns are: ${candidacyColumns.join(', ')}`,
        },
      ),
  })
  .strict()

export class RaceFilterDto extends createZodDto(raceFilterSchema) {}

const brHashIdParamSchema = z.object({
  // BallotReady GraphQL Node IDs are base64 strings of `gid://...`. They
  // always decode from `Z2lkOi8v` (the encoded prefix `gid://`). We accept
  // any non-empty string here and let the lookup decide whether it matches
  // a real Race row; that keeps validation lenient enough to not block on
  // unexpected format variations from BR while still rejecting empty input.
  brHashId: z.string().trim().min(1, 'brHashId is required'),
})

export class GetRaceByBrHashIdParamsDTO extends createZodDto(
  brHashIdParamSchema,
) {}
