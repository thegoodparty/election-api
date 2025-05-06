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
    const { slug, raceSlug, state, columns, includeStances } = filterDto

    const where: Prisma.CandidacyWhereInput = {
      ...(slug && { slug }),
      ...(state && { state }),
      ...(raceSlug && { Race: { slug: raceSlug } }),
    }

    const candidacySelectBase = columns
      ? (buildColumnSelect(columns) as Prisma.CandidacySelect)
      : undefined

    const stanceInclude = { include: { Issue: true } } as const

    const candidacySelection = this.makeCandidacySelection(
      includeStances ?? false,
      candidacySelectBase,
      stanceInclude,
    )

    return candidacySelectBase
      ? this.model.findMany({ where, select: candidacySelection })
      : this.model.findMany({ where, include: candidacySelection })
  }

  private makeCandidacySelection(
    withStances: boolean,
    candidacySelectBase: Prisma.CandidacySelect | undefined,
    stanceInclude: { include: { Issue: true } },
  ): Prisma.CandidacySelect | Prisma.CandidacyInclude | undefined {
    if (!candidacySelectBase) {
      return withStances ? { Stances: stanceInclude } : undefined
    }

    const sel: Prisma.CandidacySelect = { ...candidacySelectBase }
    if (withStances) sel.Stances = stanceInclude
    return sel
  }
}
