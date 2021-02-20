import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { Boundary, FormControl } from '../../components'
import { FiatCurrencyCode, PrivateSeed, PublicSeed, RawKey, RenameWallet, Tokens } from '.'

const Matcher: React.FC<{ query: string; match: string }> = ({ children, query, match }) => {
  const matches = (query: string, target: string) => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return normalize(target).includes(normalize(query))
  }

  return <>{matches(query, match) ? children : null}</>
}

export const Settings: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [query, setQuery] = React.useState('')

  return (
    <>
      <FormControl placeholder={'Search'} onChange={(event) => setQuery(event.currentTarget.value)} />

      <Matcher query={query} match={'rename wallet'}>
        <RenameWallet wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'fiat currency Code'}>
        <FiatCurrencyCode wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'private seed'}>
        <PrivateSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'public seed'}>
        <PublicSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'raw key'}>
        <RawKey wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'tokens'}>
        <Boundary>
          <Tokens wallet={wallet} />
        </Boundary>
      </Matcher>
    </>
  )
}
