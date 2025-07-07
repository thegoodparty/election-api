import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import {
  ProjectedTurnoutManyQueryDTO,
  ProjectedTurnoutQueryDTO,
} from './projectedTurnout.schema'

@Injectable()
export class ProjectedTurnoutService extends createPrismaBase(
  MODELS.ProjectedTurnout,
) {
  constructor() {
    super()
  }

  async getProjectedTurnout(dto: ProjectedTurnoutQueryDTO) {
    const record = this.model.findFirst({
      // TODO: change to find Unique
      where: { ...dto },
    })

    return record
  }
  async getManyProjectedTurnouts(dto: ProjectedTurnoutManyQueryDTO) {
    const {
      state,
      L2DistrictType,
      L2DistrictName,
      electionYear,
      electionCode,
      includeDistrict,
    } = dto

    let districtinclude = includeDistrict
    if (state || L2DistrictType || L2DistrictName) districtinclude = true

    return districtinclude
      ? this.model.findMany({
          where: {
            district: {
              state,
              L2DistrictType,
              L2DistrictName,
            },
            electionYear,
            electionCode,
          },
          include: { district: districtinclude },
        })
      : this.model.findMany({
          where: {
            electionYear,
            electionCode,
          },
        })
  }
}
