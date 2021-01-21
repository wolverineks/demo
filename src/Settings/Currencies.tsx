import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { useActiveInfos, useDefaultFiatInfo, useDenominations } from '../hooks'
import { FiatInfo } from '../utils'

const normalize = (text: string) => text.trim().toLowerCase()

const isToken = (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo): info is EdgeMetaToken =>
  (info as any).currencyName != null

const isFiat = (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo): info is FiatInfo =>
  (info as any).isoCurrencyCode != null

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
  const { all, display, setDisplay } = useDenominations(account, currencyCode)

  return (
    <>
      <ListGroupItem>Denomination</ListGroupItem>
      {all.length <= 0 ? (
        <ListGroupItem>No Denominations</ListGroupItem>
      ) : (
        all.map((denomination) => (
          <Denomination
            key={`${denomination.name} - ${denomination.symbol}`}
            denomination={denomination}
            onSelect={() => setDisplay(denomination)}
            isSelected={denomination.multiplier === display.multiplier}
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
