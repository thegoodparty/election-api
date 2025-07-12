import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import {
  ProjectedTurnoutManyQueryDTO,
  ProjectedTurnoutUniqueDTO,
} from './projectedTurnout.schema'
import { ElectionCode } from '@prisma/client'

@Injectable()
export class ProjectedTurnoutService extends createPrismaBase(
  MODELS.ProjectedTurnout,
) {
  private static readonly CONSOLIDATED_2YR_STATES = new Set([
    'LA',
    'MS',
    'NJ',
    'VA',
  ] as const)
  private static readonly CONSOLIDATED_4YR_STATES = new Set(['KS'] as const)

  private static makeStateGuard<Code extends string>(set: ReadonlySet<Code>) {
    return (s: string): s is Code => set.has(s as Code)
  }

  private static readonly isTwoYearState =
    ProjectedTurnoutService.makeStateGuard(
      ProjectedTurnoutService.CONSOLIDATED_2YR_STATES,
    )

  private static readonly isFourYearState =
    ProjectedTurnoutService.makeStateGuard(
      ProjectedTurnoutService.CONSOLIDATED_4YR_STATES,
    )

  constructor() {
    super()
  }

  async getProjectedTurnout(dto: ProjectedTurnoutUniqueDTO) {
    const {
      electionYear,
      electionDate,
      state,
      L2DistrictType,
      L2DistrictName,
    } = dto
    const electionCode =
      dto.electionCode ?? this.determineElectionCode(electionDate, state)
    return this.model.findFirst({
      where: {
        electionCode,
        electionYear,
        district: {
          L2DistrictType,
          L2DistrictName,
        },
      },
    })
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

    const districtInclude = (state || L2DistrictType || L2DistrictName) ? true : includeDistrict

    return districtInclude
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
        include: { district: districtInclude },
      })
      : this.model.findMany({
        where: {
          electionYear,
          electionCode,
        },
      })
  }

  private isTuesdayAfterFirstMondayInNov(date: Date): boolean {
    const day = date.getDate()
    return date.getMonth() === 10 && date.getDay() === 2 && day > 1 && day <= 8
  }

  private determineElectionCode(
    electionDate: string,
    state: string,
  ): ElectionCode {
    // Converted from Nigel's Python, you probably shouldn't touch this
    const date = new Date(`${electionDate}T00:00:00`)
    const year = date.getFullYear()

    if (!this.isTuesdayAfterFirstMondayInNov(date)) {
      return ElectionCode.LocalOrMunicipal
    }

    if (year % 2 === 0) {
      return ElectionCode.General
    }

    if (
      ProjectedTurnoutService.isTwoYearState(state) &&
      ProjectedTurnoutService.CONSOLIDATED_2YR_STATES.has(state)
    ) {
      return ElectionCode.ConsolidatedGeneral
    }

    const isFourthYear = (year - 2003) % 4 === 0
    if (
      ProjectedTurnoutService.isFourYearState(state) &&
      ProjectedTurnoutService.CONSOLIDATED_4YR_STATES.has(state) &&
      isFourthYear
    ) {
      return ElectionCode.ConsolidatedGeneral
    }

    return ElectionCode.LocalOrMunicipal
  }
}
