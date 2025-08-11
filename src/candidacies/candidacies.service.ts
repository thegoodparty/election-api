import { Injectable } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { CandidacyFilterDto } from './candidacies.schema'
import { Prisma } from '@prisma/client'

@Injectable()
export class CandidaciesService extends createPrismaBase(MODELS.Candidacy) {
  async getCandidacies(filterDto: CandidacyFilterDto) {
    const {
      slug,
      raceSlug,
      state,
      columns,
      includeStances,
      includeRace,
      raceColumns,
    } = filterDto

    const where: Prisma.CandidacyWhereInput = {
      ...(slug && { slug }),
      ...(state && { state }),
      ...(raceSlug && { Race: { slug: raceSlug } }),
    }

    const candidacySelectBase = columns
      ? (buildColumnSelect(columns) as Prisma.CandidacySelect)
      : undefined

    const stanceInclude = { include: { Issue: true } } as const
    const raceInclude = this.buildRaceInclude(raceColumns, includeRace)

    const candidacySelection = this.makeCandidacySelection(
      includeStances ?? false,
      includeRace ?? false,
      candidacySelectBase,
      stanceInclude,
      raceInclude,
    )

    return candidacySelectBase
      ? this.model.findMany({ where, select: candidacySelection })
      : this.model.findMany({ where, include: candidacySelection })
  }

  private makeCandidacySelection(
    withStances: boolean,
    withRace: boolean,
    candidacySelectBase: Prisma.CandidacySelect | undefined,
    stanceInclude: { include: { Issue: true } },
    raceInclude:
      | true
      | {
          select: Prisma.RaceSelect
        },
  ): Prisma.CandidacySelect | Prisma.CandidacyInclude | undefined {
    if (!candidacySelectBase) {
      if (!withStances && !withRace) return undefined

      return {
        ...(withStances ? { Stances: stanceInclude } : {}),
        ...(withRace ? { Race: raceInclude } : {}),
      }
    }

    const sel: Prisma.CandidacySelect = { ...candidacySelectBase }
    if (withStances) sel.Stances = stanceInclude
    if (withRace) sel.Race = raceInclude
    return sel
  }

  private buildRaceInclude(
    raceColumns: string | undefined | null,
    includeRace: boolean | undefined | null,
  ) {
    if (!raceColumns) return true
    if (!includeRace) return true

    return {
      select: buildColumnSelect(raceColumns) as Prisma.RaceSelect,
    }
  }
}
