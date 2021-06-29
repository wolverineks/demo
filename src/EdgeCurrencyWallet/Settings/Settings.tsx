import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { Boundary, FormControl, Matcher } from '../../components'
import { FiatCurrencyCode, PrivateSeed, PublicSeed, RawKey, RenameWallet, Tokens } from '.'

export const Settings: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [query, setQuery] = React.useState('')

  return (
    <>
      <FormControl placeholder={'Search'} onChange={(event) => setQuery(event.currentTarget.value)} />

      <Matcher query={query} matchers={['rename wallet']}>
        <RenameWallet wallet={wallet} />
      </Matcher>

      <Matcher query={query} matchers={['fiat currency Code']}>
        <FiatCurrencyCode wallet={wallet} />
      </Matcher>

      <Matcher query={query} matchers={['private seed']}>
        <PrivateSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} matchers={['public seed']}>
        <PublicSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} matchers={['raw key']}>
        <RawKey wallet={wallet} />
      </Matcher>

      <Matcher query={query} matchers={['tokens']}>
        <Boundary>
          <Tokens wallet={wallet} />
        </Boundary>
      </Matcher>
    </>
  )
}
