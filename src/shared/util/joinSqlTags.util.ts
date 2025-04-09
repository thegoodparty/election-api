import { sql } from '@ts-safeql/sql-tag'

// SqlTag is an exported type from SafeQL, so we get it here
export type SqlFragment = ReturnType<typeof sql>

export function joinSqlTags(
  fragments: (SqlFragment | null | undefined)[],
  separator: string | SqlFragment
): SqlFragment {
  const validFragments = fragments.filter((fragment): fragment is SqlFragment => 
    fragment !== null && fragment !== undefined
  )

  if (validFragments.length === 0) return sql``

  return validFragments.reduce((acc, fragment, index) => {
    if (index === 0) return fragment

    return sql`${acc}${separator}${fragment}`
  }, sql``)
}