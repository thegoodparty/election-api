import { sql } from '@ts-safeql/sql-tag'
import { PlaceFilterDto } from '../places.schema'

export function buildGetPlacesTreeQuery(filterDto: PlaceFilterDto) {
  const {
    includeChildren = true,
    includeParent = false,
    includeRaces = false,
    depth = 1,
    state,
    name,
    mtfcc,
    placeColumns,
    raceColumns
  } = filterDto

  const additionalPlaceColumns = placeColumns ? placeColumns.split(',').map(col => col.trim()) : []
  const raceColumnsArray = raceColumns ? raceColumns.split(',').map(col => col.trim()) : []

  const baseColumns = ['id', 'name', 'slug']
  const columnsToSelect = [...new Set([...baseColumns, ...additionalPlaceColumns])]
  const columnString = columnsToSelect.join(', ')
  const recursiveColumnString = columnsToSelect
    .map((col) => `p.${col}`)
    .join(', ')
  
  const conditions = [
    state ? `state = '${state}'` : null,
    name ? `name LIKE '${name}'` : null,
    mtfcc ? `mtfcc = '${mtfcc}'` : null
  ].filter(Boolean)
  const whereConditions = conditions.join(' AND ') || 'true'

  const fragments: any = []

  // Base clause
  fragments.push(sql`
    SELECT ${columnString}, parent_id, ${includeParent ? 0 : 1} AS depth, 'self' as relation_type
    FROM place
    WHERE ${whereConditions}
  `)

  if (includeParent) {
    fragments.push(sql`
      SELECT ${recursiveColumnString}, p.parent_id, ph.depth - 1 AS depth, 'parent' as relation_type
      FROM place p
      JOIN place_hierarchy ph ON p.id = ph.parent_id
      WHERE ph.relation_type IN ('self', 'parent')
    `)
  }

  if (includeChildren) {
    fragments.push(sql`
      SELECT ${recursiveColumnString}, p.parent_id, ph.depth + 1 AS depth, 'child' as relation_type
      FROM place p
      JOIN place_hierarchy ph ON p.parent_id = ph.id
      WHERE ph.depth < ${depth}
    `)
  }

  let query = sql`WITH RECURSIVE place_hierarchy AS (
    ${sql.join(fragments, sql` UNION ALL `)}
  )`

  const finalSelectColumns = `${columnString}, depth, relation_type`

  if (includeRaces) {
    const defaultRaceColumns = ['id', 'positionSlug']
    const selectedRaceColumns = raceColumnsArray.length > 0 ? raceColumnsArray : defaultRaceColumns
    const raceSelectColumns = selectedRaceColumns.map(col => `r.${col}`).join(', ')
    query = sql`${query}
      SELECT ${finalSelectColumns}, ${raceSelectColumns}
      FROM place_hierarchy ph
      LEFT JOIN race r on ph.id = r.place_id
      ORDER BY ph.depth, ph.id
    `
  } else {
    query = sql`${query}
      SELECT ${finalSelectColumns}
      FROM place_hierarchy
      ORDER BY depth, id
    `
  }

  return query
}
