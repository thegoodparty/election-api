import { Position, ProjectedTurnout } from '@prisma/client'

export type PositionWithOptionalDistrict = Pick<
  Position,
  'id' | 'brPositionId' | 'brDatabaseId' | 'state'
> & {
  name?: string | null
  district?: {
    id: string
    L2DistrictType: string
    L2DistrictName: string
    projectedTurnout: ProjectedTurnout | null
  }
}
