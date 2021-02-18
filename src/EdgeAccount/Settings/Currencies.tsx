import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'
import { useQuery } from 'react-query'

import { useEdgeAccount } from '../../auth'
import { Boundary, Logo } from '../../components'
import { useActiveCurrencyCodes, useDefaultFiatCurrencyCode, useDenominations, useInfo, useWatch } from '../../hooks'
import { FiatInfo, getSortedCurrencyWallets, isFiat, isToken, normalize, unique } from '../../utils'

const useWalletFiatCurrencyCodes = (account: EdgeAccount) => {
  const getWalletFiatCurrencyCodes = () =>
    unique(getSortedCurrencyWallets(account).map(({ fiatCurrencyCode }) => fiatCurrencyCode))

  const { refetch, data } = useQuery('walletFiatCurrencyCodes', () => getWalletFiatCurrencyCodes())
  useWatch(account, 'currencyWallets', () => refetch())

  return data!
}

export const Currencies: React.FC = () => {
  const account = useEdgeAccount()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const walletFiatCurrencyCodes = useWalletFiatCurrencyCodes(account)
  const settings = unique([fiatCurrencyCode, ...walletFiatCurrencyCodes, ...useActiveCurrencyCodes(account)])

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      {settings.map((currencyCode) => (
        <Matcher key={currencyCode} currencyCode={currencyCode} query={searchQuery}>
          <CurrencySetting currencyCode={currencyCode} />
        </Matcher>
      ))}
    </ListGroup>
  )
}

const matches = (query: string) => (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo) =>
  normalize(info.currencyCode).includes(normalize(query)) ||
  (isToken(info)
    ? normalize(info.currencyName).includes(normalize(query))
    : isFiat(info)
    ? normalize(info.currencyCode).includes(normalize(query))
    : normalize(info.displayName).includes(normalize(query)))

const Matcher: React.FC<{ query: string; currencyCode: string }> = ({ query, currencyCode, children }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return <>{matches(query)(info) ? children : null}</>
}

const CurrencySetting: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo currencyCode={info.currencyCode} />
        {isToken(info) ? info.currencyName : info.displayName} - {info.currencyCode}
      </ListGroupItem>
      <Boundary>
        <Denominations currencyCode={info.currencyCode} />
      </Boundary>
    </ListGroup>
  )
}

const Denominations = ({ currencyCode }: { currencyCode: string }) => {
  const account = useEdgeAccount()
  const denominations = useDenominations(account, currencyCode)

  return (
    <>
      <ListGroupItem>Denomination</ListGroupItem>
      {denominations.all.length <= 0 ? (
        <ListGroupItem>No Denominations</ListGroupItem>
      ) : (
        denominations.all.map((denomination) => (
          <Denomination
            key={`${denomination.name} - ${denomination.symbol}`}
            denomination={denomination}
            onSelect={() => denominations.setDisplay(denomination.multiplier)}
            isSelected={denomination.multiplier === denominations.display.multiplier}
          />
        ))
      )}
    </>
  )
}

const Denomination: React.FC<{
  denomination: EdgeDenomination
  onSelect: () => any
  isSelected: boolean
}> = ({ denomination, onSelect, isSelected }) => (
  <ListGroupItem onClick={() => onSelect()} variant={isSelected ? 'primary' : undefined}>
    {denomination.name}, {denomination.multiplier}, {denomination.symbol}
  </ListGroupItem>
)
