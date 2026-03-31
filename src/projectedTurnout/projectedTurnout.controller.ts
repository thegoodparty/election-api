import { Controller, Query, Get, NotFoundException } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'
import { ProjectedTurnoutUniqueDTO } from './projectedTurnout.schema'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout(@Query() dto: ProjectedTurnoutUniqueDTO) {
    const record = await this.projectedTurnoutService.getProjectedTurnout(dto)
    if (!record) {
      // Format the error message in a more readable way
      const formattedParams = this.formatDtoForError(dto)
      throw new NotFoundException(
        `Projected turnout not found for the following parameters:\n${formattedParams}`,
      )
    }
    return record
  }

  private formatDtoForError(dto: ProjectedTurnoutUniqueDTO): string {
    const { districtId, state, electionDate, L2DistrictType, L2DistrictName } =
      dto
    const params: string[] = []

    if (districtId) {
      params.push(`District ID: ${districtId}`)
    }

    if (state) {
      params.push(`State: ${state}`)
    }

    if (electionDate) {
      params.push(`Election Date: ${electionDate}`)
    }

    if (L2DistrictType) {
      let districtTypeLabel = ''
      if (typeof L2DistrictType === 'string') {
        try {
          const parsed = JSON.parse(L2DistrictType)
          districtTypeLabel =
            parsed.label || parsed.L2DistrictType || L2DistrictType
        } catch {
          // If parsing fails, use the string as-is
          districtTypeLabel = L2DistrictType
        }
      } else {
        districtTypeLabel = String(L2DistrictType)
      }
      params.push(`District Type: ${districtTypeLabel}`)
    }

    if (L2DistrictName) {
      let districtName = ''
      if (typeof L2DistrictName === 'string') {
        try {
          const parsed = JSON.parse(L2DistrictName)
          districtName = parsed.L2DistrictName || L2DistrictName
        } catch {
          // If parsing fails, use the string as-is
          districtName = L2DistrictName
        }
      } else {
        districtName = String(L2DistrictName)
      }
      params.push(`District Name: ${districtName}`)
    }

    return params.join('\n')
  }
}
