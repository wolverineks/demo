import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { useActiveInfos, useDefaultFiatInfo, useDenominations } from '../hooks'
import { FiatInfo, isFiat, isToken, normalize } from '../utils'

const matches = (query: string) => (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo) =>
  normalize(info.currencyCode).includes(normalize(query)) ||
  (isToken(info)
    ? normalize(info.currencyName).includes(normalize(query))
    : isFiat(info)
    ? normalize(info.currencyCode)
    : normalize(info.displayName).includes(normalize(query)))

export const Currencies: React.FC = () => {
  const account = useEdgeAccount()
  const [searchQuery, setSearchQuery] = React.useState('')
  const fiatInfo = useDefaultFiatInfo(account)
  const visibleSettings = [...useActiveInfos(account), (fiatInfo as unknown) as EdgeCurrencyInfo].filter(
    matches(searchQuery),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
      {visibleSettings.length <= 0 ? (
        <div>No matching settings</div>
      ) : (
        visibleSettings.map((currencyInfo) => <CurrencySetting key={currencyInfo.currencyCode} info={currencyInfo} />)
      )}
    </ListGroup>
  )
}

const CurrencySetting: React.FC<{ info: EdgeCurrencyInfo | EdgeMetaToken }> = ({ info }) => {
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
            onSelect={() => denominations.setDisplay(denomination)}
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
