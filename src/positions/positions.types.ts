import { Position, ProjectedTurnout } from '@prisma/client'
import type { FilingFeeExtractionSource } from './util/filingFee.util'

export type PositionWithOptionalDistrict = Pick<
  Position,
  'id' | 'brPositionId' | 'brDatabaseId' | 'state'
> & {
  name?: string | null
  level: Position['level']
  district?: {
    id: string
    L2DistrictType: string
    L2DistrictName: string
    projectedTurnout: ProjectedTurnout | null
  }
  filingFee?: number | null
  filingRequirementsText?: string | null
  filingFeeExtractionSource?: FilingFeeExtractionSource | null
}
