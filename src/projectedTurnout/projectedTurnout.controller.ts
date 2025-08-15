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
    const params: string[] = []

    if (dto.state) {
      params.push(`State: ${dto.state}`)
    }

    if (dto.electionDate) {
      params.push(`Election Date: ${dto.electionDate}`)
    }

    if (dto.L2DistrictType) {
      let districtTypeLabel = ''
      if (typeof dto.L2DistrictType === 'string') {
        try {
          const parsed = JSON.parse(dto.L2DistrictType)
          districtTypeLabel =
            parsed.label || parsed.L2DistrictType || dto.L2DistrictType
        } catch {
          // If parsing fails, use the string as-is
          districtTypeLabel = dto.L2DistrictType
        }
      } else {
        districtTypeLabel = String(dto.L2DistrictType)
      }
      params.push(`District Type: ${districtTypeLabel}`)
    }

    if (dto.L2DistrictName) {
      let districtName = ''
      if (typeof dto.L2DistrictName === 'string') {
        try {
          const parsed = JSON.parse(dto.L2DistrictName)
          districtName = parsed.L2DistrictName || dto.L2DistrictName
        } catch {
          // If parsing fails, use the string as-is
          districtName = dto.L2DistrictName
        }
      } else {
        districtName = String(dto.L2DistrictName)
      }
      params.push(`District Name: ${districtName}`)
    }

    return params.join('\n')
  }
}
