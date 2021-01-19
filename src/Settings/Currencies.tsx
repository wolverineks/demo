import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { useActiveInfos, useDenominations } from '../hooks'

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (query: string) => (info: EdgeCurrencyInfo | EdgeMetaToken) =>
  normalize(info.currencyCode).includes(normalize(query)) ||
  (isToken(info)
    ? normalize(info.currencyName).includes(normalize(query))
    : normalize(info.displayName).includes(normalize(query)))

export const Currencies: React.FC = () => {
  const account = useEdgeAccount()
  const [searchQuery, setSearchQuery] = React.useState('')
  const visibleSettings = useActiveInfos(account).filter(matches(searchQuery))

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

const isToken = (info: EdgeCurrencyInfo | EdgeMetaToken): info is EdgeMetaToken => (info as any).currencyName != null

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
  const {
    denominations,
    display: [displayDenomination, write],
  } = useDenominations(account, currencyCode)

  return (
    <>
      <ListGroupItem>Denomination</ListGroupItem>
      {denominations.length <= 0 ? (
        <ListGroupItem>No Denominations</ListGroupItem>
      ) : (
        denominations.map((denomination) => (
          <Denomination
            key={denomination.name}
            denomination={denomination}
            onSelect={() => write(denomination)}
            isSelected={denomination.multiplier === displayDenomination.multiplier}
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
