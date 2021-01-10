import * as React from 'react'

export const useFilter = <Item>(matches: (searchQuery: string) => (item: Item) => boolean, collection: Item[]) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const result = collection.filter(matches(searchQuery))

  return [result, setSearchQuery] as const
}
