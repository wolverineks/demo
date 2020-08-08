import React from 'react'

type SetSearchQuery = (searchQuery: string) => undefined

const SearchQueryContext = React.createContext<string | undefined>(undefined)
const SetSearchQueryContext = React.createContext<SetSearchQuery | undefined>(undefined)

export const SearchQueryProvider: React.FC = ({ children }) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  return (
    <SearchQueryContext.Provider value={searchQuery}>
      <SetSearchQueryContext.Provider value={setSearchQuery as SetSearchQuery}>
        {children}
      </SetSearchQueryContext.Provider>
    </SearchQueryContext.Provider>
  )
}

const missingProvider = () => {
  throw new Error('useSearchQuery must be rendered inside a <SearchQueryProvider>')
}

export const SearchQueryConsumer = ({ children }: { children: (searchQuery: string) => any }) =>
  children(useSearchQuery())
export const SetSearchQueryConsumer = ({ children }: { children: (setSearchQuery: SetSearchQuery) => any }) =>
  children(useSetSearchQuery())

export const useSetSearchQuery = () => React.useContext(SetSearchQueryContext) || missingProvider()
export const useSearchQuery = () => React.useContext(SearchQueryContext) ?? missingProvider()
