import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { VoterIssue } from './voterIssues.schema'

@Injectable()
export class VoterIssuesService extends createPrismaBase(
  MODELS.DistrictTopIssue,
) {
  constructor() {
    super()
  }

  async getVoterIssues(params: {
    districtId: string
    limit: number
  }): Promise<VoterIssue[]> {
    const rows = await this.model.findMany({
      where: { districtId: params.districtId },
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
}
