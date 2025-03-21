import { sql } from '@ts-safeql/sql-tag'
import { PlaceFilterDto } from '../places.schema'


export function buildGetPlacesTreeQuery(filterDto: PlaceFilterDto) {
  const { includeChildren, includeParent, includeRaces, depth, state, name, mtfcc } = filterDto

  sql`WITH RECURSIVE place_hierarchy AS (
    -- Base case
    SELECT id, name, slug, parent_id, 1 AS depth
    FROM place
    WHERE id = 'starting-place-id'
    
    UNION ALL

    -- Recursive case: join with children
    SELECT p.id, p.name. p.slug, p.parent_id, ph.depth + 1
    FROM place p
    JOIN place_hierarchy ph ON p.parent_id = ph.id
    WHERE ph.depth < ${depth}
    )
    SELECT & FROM place_hierarchy;`
    
}