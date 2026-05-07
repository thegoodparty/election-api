export type RaceListItem = {
  id: string
  brPositionId: string
  position: {
    name: string
    level: string
    state: string
    normalizedPosition?: { name: string }
  }
  election: {
    electionDay: string
  }
  city?: string | null
  district?: string | null
}
