import { Injectable, NotFoundException } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { VoterIssue } from './voterIssues.schema'

type ResolveDistrictParams = {
  districtId?: string
  ballotReadyPositionId?: string
}

@Injectable()
export class VoterIssuesService extends createPrismaBase(
  MODELS.DistrictTopIssue,
) {
  constructor() {
    super()
  }

  async getVoterIssues(params: {
    districtId?: string
    ballotReadyPositionId?: string
    state?: string
    city?: string
    limit: number
  }): Promise<VoterIssue[]> {
    const districtId = await this.resolveDistrictId({
      districtId: params.districtId,
      ballotReadyPositionId: params.ballotReadyPositionId,
    })
    if (!districtId) return []

    const rows = await this.model.findMany({
      where: { districtId },
      orderBy: { issueRank: 'asc' },
      take: params.limit,
      select: { issueLabel: true, score: true, issueRank: true },
    })

    return rows.map((row) => ({
      label: row.issueLabel,
      score: row.score,
      priority: this.priorityForRank(row.issueRank),
    }))
  }

  private priorityForRank(rank: number): VoterIssue['priority'] {
    if (rank <= 3) return 'high'
    if (rank <= 6) return 'medium'
    return 'low'
  }

  private async resolveDistrictId(
    params: ResolveDistrictParams,
  ): Promise<string | null> {
    if (params.districtId) return params.districtId

    if (params.ballotReadyPositionId) {
      const position = await this.client.position.findUnique({
        where: { brPositionId: params.ballotReadyPositionId },
        select: { districtId: true },
      })
      if (!position) {
        throw new NotFoundException(
          `Position not found for brPositionId=${params.ballotReadyPositionId}`,
        )
      }
      return position.districtId
    }

    return null
  }
}
