import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const getPositionByBrIdParamsSchema = z.object({
  brPositionId: z.string().min(1, 'BallotReady Position ID is required'),
})

export const getPositionByBrIdQuerySchema = z
  .object({
    includeTurnout: z.preprocess(
      (val) =>
        val === 'true' || val === '1' || val === true
          ? true
          : val === 'false' || val === '0' || val === false
            ? false
            : undefined,
      z.boolean().optional().default(true),
    ),
    includeDistrict: z.coerce.boolean().optional(),
    electionDate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined) return true
          return !isNaN(new Date(val).getTime())
        },
        {
          message: 'Invalid date string',
        },
      ),
  })
  .refine(
    (data) => {
      if (data.includeTurnout) {
        return data.electionDate !== undefined
      }
      return true
    },
    {
      message: 'When includeTurnout is true, electionDate has to be provided',
      path: ['electionDate'],
    },
  )
// // TODO: Remove this after gp-api is updated, this is just to prevent a circular merge dependency
// .refine((data) => {
//   if (data.includeDistrict) {
//     data.includeTurnout = true
//   }
// })

export const getPositionByBrIdRequestSchema = z.object({
  params: getPositionByBrIdParamsSchema,
  query: getPositionByBrIdQuerySchema,
})

export class GetPositionByBrIdQueryDTO extends createZodDto(
  getPositionByBrIdQuerySchema,
) {}
export class GetPositionByBrIdParamsDTO extends createZodDto(
  getPositionByBrIdParamsSchema,
) {}
