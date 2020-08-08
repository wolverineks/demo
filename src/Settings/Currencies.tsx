import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { useActiveCurrencyInfos, useActiveTokenInfos, useDisplayDenomination } from '../hooks'

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (query: string) => (info: EdgeCurrencyInfo | EdgeMetaToken) =>
  normalize(info.currencyCode).includes(normalize(query)) ||
  (isToken(info)
    ? normalize(info.currencyName).includes(normalize(query))
    : normalize(info.displayName).includes(normalize(query)))

export const Currencies: React.FC<{ query: string }> = ({ query }) => {
  const currencyInfos = useActiveCurrencyInfos(useAccount())
  const tokenInfos = useActiveTokenInfos(useAccount())
  const visibleSettings = [...currencyInfos, ...tokenInfos].filter(matches(query))

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      {visibleSettings.map((currencyInfo) => (
        <Boundary key={currencyInfo.currencyCode}>
          <CurrencySetting info={currencyInfo} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const isToken = (info: EdgeCurrencyInfo | EdgeMetaToken): info is EdgeMetaToken => (info as any).currencyName != null

const CurrencySetting: React.FC<{ info: EdgeCurrencyInfo | EdgeMetaToken }> = ({ info }) => {
  const [denomination, write] = useDisplayDenomination(useAccount(), info.currencyCode)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo currencyCode={info.currencyCode} />
        {isToken(info) ? info.currencyName : info.displayName} - {info.currencyCode}
      </ListGroupItem>
      <Denominations denominations={info.denominations} onSelect={write} selectedDenomination={denomination} />
    </ListGroup>
  )
}

const Denominations = ({
  denominations,
  onSelect,
  selectedDenomination,
}: {
  denominations: EdgeDenomination[]
  selectedDenomination: EdgeDenomination
  onSelect: (denomination: EdgeDenomination) => any
}) => (
  <>
    <ListGroupItem>Denomination</ListGroupItem>
    {denominations.map((denomination) => (
      <Denomination
        key={denomination.name}
        denomination={denomination}
        onSelect={() => onSelect(denomination)}
        isSelected={denomination.multiplier === selectedDenomination.multiplier}
      />
    ))}
  </>
)

const Denomination: React.FC<{
  denomination: EdgeDenomination
  onSelect: () => any
  isSelected: boolean
}> = ({ denomination, onSelect, isSelected }) => (
  <ListGroupItem onClick={() => onSelect()} variant={isSelected ? 'primary' : undefined}>
    {denomination.name}, {denomination.multiplier}, {denomination.symbol}
  </ListGroupItem>
)
