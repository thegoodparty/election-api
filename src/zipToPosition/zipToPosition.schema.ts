import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const DISPLAY_OFFICE_LEVELS = [
  'City',
  'County',
  'Federal',
  'Judicial',
  'Local',
  'Regional',
  'State',
  'Township',
] as const

const OFFICE_TYPES = [
  'Attorney',
  'City Council',
  'Clerk/Treasurer',
  'Congressional',
  'County Supervisor',
  'Judge',
  'Mayor',
  'Other',
  'School Board',
  'Sheriff',
  'State House',
  'State Senate',
  'Statewide/Governor',
  'Town Council',
] as const

const arrayOrSingle = <T extends z.ZodTypeAny>(inner: T) =>
  z
    .union([inner, z.array(inner)])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : Array.isArray(v) ? v : [v],
    )

export const SearchPositionsQuerySchema = z
  .object({
    zip: z
      .string()
      .regex(/^\d{5}$/, 'zip must be 5 digits')
      .optional(),
    name: z.string().min(1).optional(),
    officeType: arrayOrSingle(z.enum(OFFICE_TYPES)),
    displayOfficeLevels: arrayOrSingle(z.enum(DISPLAY_OFFICE_LEVELS)),
    electionDateFrom: z.string().date().optional(),
    electionDateTo: z.string().date().optional(),
  })
  .refine((q) => q.zip || q.name || (q.officeType && q.officeType.length > 0), {
    message: 'At least one of zip, name, or officeType is required',
  })

export class SearchPositionsQueryDTO extends createZodDto(
  SearchPositionsQuerySchema,
) {}
