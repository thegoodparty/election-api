import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { VoterIssue, VoterIssueLevel } from './voterIssues.schema'

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
    level?: VoterIssueLevel
  }): Promise<VoterIssue[]> {
    // Filter by jurisdictional flag when `level` is provided so each persona
    // (school-board candidate, US House candidate, etc.) only sees issues
    // actionable at their office level. Without `level`, returns the overall
    // top issues by score across all 68 issues.
    const where: {
      districtId: string
      isLocal?: boolean
      isRegional?: boolean
      isState?: boolean
      isFederal?: boolean
    } = { districtId: params.districtId }
    if (params.level === 'local') where.isLocal = true
    else if (params.level === 'regional') where.isRegional = true
    else if (params.level === 'state') where.isState = true
    else if (params.level === 'federal') where.isFederal = true

    const rows = await this.model.findMany({
      where,
      orderBy: { issueRank: 'asc' },
      take: params.limit,
      select: { issueLabel: true, score: true },
    })

    // Priority is position-in-result, not the mart's precomputed issue_rank.
    // For the unfiltered case the two are identical (sorted-by-rank asc
    // produces positions 1..N matching ranks 1..N). For filtered queries the
    // top issue in the filter is always "high", even if its overall mart rank
    // is much higher than 3 — without this remapping, every local-only issue
    // would land in the "low" tier because federal noise dominates the top
    // overall ranks.
    return rows.map((row, index) => ({
      label: row.issueLabel,
      score: row.score,
      priority: this.priorityForRank(index + 1),
    }))
  }

  private priorityForRank(rank: number): VoterIssue['priority'] {
    if (rank <= 3) return 'high'
    if (rank <= 6) return 'medium'
    return 'low'
  }
}
