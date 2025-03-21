import { sql } from '@ts-safeql/sql-tag'
import { PlaceFilterDto } from '../places.schema'

export function buildGetPlacesTreeQuery(filterDto: PlaceFilterDto) {
  const {
    includeChildren,
    includeParent,
    includeRaces,
    depth,
    state,
    name,
    mtfcc,
    columns,
  } = filterDto

  const baseColumns = ['id', 'name', 'slug']

  const columnsToSelect = [...new Set([...baseColumns, ...(columns ?? [])])]

  const columnString = columnsToSelect.join(', ')
  const recursiveColumnString = columnsToSelect
    .map((col) => `p.${col}`)
    .join(', ')

  sql`WITH RECURSIVE place_hierarchy AS (
    -- Base case
    SELECT ${columnString}, parent_id, 1 AS depth
    FROM place
    WHERE id = 'starting-place-id'
    
    UNION ALL

    -- Recursive case: join with children
    SELECT ${recursiveColumnString}, p.parent_id, ph.depth + 1
    FROM place p
    JOIN place_hierarchy ph ON p.parent_id = ph.id
    WHERE ph.depth < ${depth}
    )
    SELECT ${columnString}, depth FROM place_hierarchy;`
}
