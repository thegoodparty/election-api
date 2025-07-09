import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { GetDistrictsDTO, GetDistrictTypesDTO } from './districts.schema'
import { Prisma, ElectionCode as EC } from '@prisma/client'
import { NotFoundException } from '@nestjs/common'

export class DistrictsService extends createPrismaBase(MODELS.District) {
  constructor() {
    super()
  }

  async getDistrictTypes(dto: GetDistrictTypesDTO) {
    return this.listDistinct(dto, Prisma.DistrictScalarFieldEnum.L2DistrictType)
  }

  async getDistrictNames(dto: GetDistrictsDTO) {
    // TODO: make specific DTO
    return this.listDistinct(dto, Prisma.DistrictScalarFieldEnum.L2DistrictName)
  }

  async getDistricts(dto: GetDistrictsDTO) {
    const { districtColumns, projectedTurnoutColumns } = dto

    const turnoutWhere = this.buildTurnoutWhere(dto)
    const where = this.buildDistrictWhere(dto, turnoutWhere)

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

  private buildTurnoutWhere(dto: {
    electionYear?: number | null
    electionCode?: string | null
    excludeInvalid?: boolean | null
  }): Prisma.ProjectedTurnoutWhereInput {
    return {
      ...(dto.electionYear && { electionYear: dto.electionYear }),
      ...(dto.electionCode && { electionCode: dto.electionCode as EC }),
      ...(dto.excludeInvalid && { projectedTurnout: { gt: 0 } }),
    }
  }

  private buildDistrictWhere(
    dto: {
      state?: string | null
      L2DistrictType?: string | null
      L2DistrictName?: string | null
    },
    turnoutWhere: Prisma.ProjectedTurnoutWhereInput,
  ) {
    const hasTurnout = Object.keys(turnoutWhere).length > 0
    return {
      ...(dto.state && { state: dto.state }),
      ...(dto.L2DistrictType && { L2DistrictType: dto.L2DistrictType }),
      ...(dto.L2DistrictName && { L2DistrictName: dto.L2DistrictName }),
      ...(hasTurnout && { ProjectedTurnouts: { some: turnoutWhere } }),
    }
  }

  private async listDistinct<K extends 'L2DistrictType' | 'L2DistrictName'>(
    dto: GetDistrictTypesDTO | GetDistrictsDTO,
    field: K,
  ) {
    const turnoutWhere = this.buildTurnoutWhere(dto)
    const where = this.buildDistrictWhere(dto, turnoutWhere)

    return await this.model.findMany({
      where,
      select: { id: true, [field]: true } as Prisma.DistrictSelect,
      distinct: [field],
      orderBy: { [field]: Prisma.SortOrder.asc },
    })
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
