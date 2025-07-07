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

  // async getDistrictTypes(dto: GetDistrictTypesDTO) {
  //   const { state, electionYear, excludeInvalid } = dto

  //   return (
  //     await this.model.findMany({
  //       where: {
  //         state,
  //         ...((electionYear || excludeInvalid) && {
  //           ProjectedTurnouts: {
  //             some: {
  //               ...(electionYear && { electionYear }),
  //               ...(excludeInvalid && { projectedTurnout: { gt: 0 } }),
  //             },
  //           },
  //         }),
  //       },
  //       select: { L2DistrictType: true },
  //       distinct: ['L2DistrictType'],
  //     })
  //   ).map((r) => r.L2DistrictType)
  // }

  // async getDistrictNames(dto: GetDistrictsDTO) {
  //   const { state, L2DistrictType, electionYear, excludeInvalid } = dto

  //   return (
  //     await this.model.findMany({
  //       where: {
  //         state,
  //         L2DistrictType,
  //         ...((electionYear || excludeInvalid) && {
  //           ProjectedTurnouts: {
  //             some: {
  //               ...(electionYear && { electionYear }),
  //               ...(excludeInvalid && { projectedTurnout: { gt: 0 } }),
  //             },
  //           },
  //         }),
  //       },
  //       select: { L2DistrictName: true },
  //     })
  //   ).map((r) => r.L2DistrictName)
  // }

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
    // const turnoutWhere: Prisma.ProjectedTurnoutWhereInput = {
    //   ...(electionYear && { electionYear }),
    //   ...(electionCode && { electionCode }),
    //   ...(excludeInvalid && { projectedTurnout: { gt: 0 } }),
    // }
    const turnoutWhere = this.buildTurnoutWhere(dto)
    const where = this.buildDistrictWhere(dto, turnoutWhere)
    //const hasTurnoutFilters = Object.keys(turnoutWhere).length > 0

    // const where: Prisma.DistrictWhereInput = {
    //   ...(state && { state }),
    //   ...(L2DistrictType && { L2DistrictType }),
    //   ...(L2DistrictName && { L2DistrictName }),
    //   ...(hasTurnoutFilters && { ProjectedTurnouts: { some: turnoutWhere } }),
    // }

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
  ): Promise<string[]> {
    const turnoutWhere = this.buildTurnoutWhere(dto)
    const where = this.buildDistrictWhere(dto, turnoutWhere)

    const rows = await this.model.findMany({
      where,
      select: { [field]: true } as Prisma.DistrictSelect,
      distinct: [field],
    })
    return rows.map((r) => r[field] as string)
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
