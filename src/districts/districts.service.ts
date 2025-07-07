import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { GetDistrictsDTO, GetDistrictTypesDTO } from './districts.schema'
import { Prisma } from '@prisma/client'
import { NotFoundException } from '@nestjs/common'

export class DistrictsService extends createPrismaBase(MODELS.District) {
  constructor() {
    super()
  }

  async getDistrictTypes(dto: GetDistrictTypesDTO) {
    const { state, electionYear, excludeInvalid } = dto
    const includeTurnout = electionYear || excludeInvalid

    return (
      await this.model.findMany({
        where: {
          state,
          ...(includeTurnout && {
            ProjectedTurnouts: {
              ...(electionYear && { some: { electionYear } }), // "At least one"
              ...(excludeInvalid && { projectedTurnout: { gt: 0 } }),
            },
          }),
        },
        select: { L2DistrictType: true },
        distinct: ['L2DistrictType'],
      })
    ).map((r) => r.L2DistrictType)
  }

  async getDistricts(dto: GetDistrictsDTO) {
    const {
      state,
      L2DistrictName,
      L2DistrictType,
      electionYear,
      electionCode,
      excludeInvalid,
      districtColumns,
      projectedTurnoutColumns,
    } = dto
    const turnoutWhere: Prisma.ProjectedTurnoutWhereInput = {
      ...(electionYear && { electionYear }),
      ...(electionCode && { electionCode }),
      ...(excludeInvalid && { projectedTurnout: { gt: 0 } }),
    }

    const hasTurnoutFilters = Object.keys(turnoutWhere).length > 0

    const where: Prisma.DistrictWhereInput = {
      ...(state && { state }),
      ...(L2DistrictType && { L2DistrictType }),
      ...(L2DistrictName && { L2DistrictName }),
      ...(hasTurnoutFilters && { ProjectedTurnouts: { some: turnoutWhere } }),
    }

    const districtSelectBase: Prisma.DistrictSelect | undefined =
      districtColumns
        ? (buildColumnSelect(districtColumns) as Prisma.DistrictSelect)
        : undefined

    const projectedTurnoutInclude = this.buildProjectedTurnoutInclude(
      projectedTurnoutColumns,
      turnoutWhere,
    )

    const districtQueryObj = {
      ...(districtSelectBase ?? {}),
      ...(projectedTurnoutInclude && {
        ProjectedTurnouts: projectedTurnoutInclude,
      }),
    }

    const districts = districtSelectBase
      ? await this.model.findMany({
          where,
          select: districtQueryObj,
        })
      : await this.model.findMany({
          where,
          include: districtQueryObj,
        })

    if (!districts || districts.length === 0) {
      throw new NotFoundException(
        `No districts found for query: ${JSON.stringify(where)}`,
      )
    }

    return districts
  }

  private buildProjectedTurnoutInclude(
    projectedTurnoutColumns?: string | null,
    turnoutWhere?: Prisma.ProjectedTurnoutWhereInput,
  ) {
    if (!projectedTurnoutColumns) return true

    const select = buildColumnSelect(
      projectedTurnoutColumns,
    ) as Prisma.ProjectedTurnoutSelect

    return {
      select,
      where:
        turnoutWhere && Object.keys(turnoutWhere).length
          ? turnoutWhere
          : undefined,
    }
  }
}
