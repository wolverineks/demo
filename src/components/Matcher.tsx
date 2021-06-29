import React from 'react'

import { normalize } from '../utils'

export const Matcher: React.FC<{ query: string; matchers: string[] }> = ({ children, query, matchers }) => {
  const matches = (query: string, match: string) => {
    return normalize(match).includes(normalize(query))
  }

  return <>{matchers.some((match) => matches(query, match)) ? children : null}</>
}
