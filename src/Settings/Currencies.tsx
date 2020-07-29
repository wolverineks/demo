import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { useActiveCurrencyInfos, useActiveTokenInfos, useDisplayDenomination } from '../hooks'

export const Currencies = () => {
  const currencyInfos = useActiveCurrencyInfos(useAccount())
  const tokenInfos = (useActiveTokenInfos(useAccount()) as unknown) as EdgeMetaToken[]

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      {currencyInfos.map((currencyInfo) => (
        <Boundary key={currencyInfo.currencyCode}>
          <CurrencySetting currencyInfo={currencyInfo} />
        </Boundary>
      ))}

      {tokenInfos.map((tokenInfo) => (
        <Boundary key={tokenInfo.currencyCode}>
          <TokenSetting tokenInfo={tokenInfo} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const CurrencySetting: React.FC<{ currencyInfo: EdgeCurrencyInfo }> = ({ currencyInfo }) => {
  const { displayName, denominations, currencyCode } = currencyInfo
  const [denomination, write] = useDisplayDenomination(useAccount(), currencyCode)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo currencyCode={currencyCode} />
        {displayName} - {currencyCode}
      </ListGroupItem>
      <Denominations denominations={denominations} onSelect={write} selectedDenomination={denomination} />
    </ListGroup>
  )
}

const TokenSetting: React.FC<{ tokenInfo: EdgeMetaToken }> = ({ tokenInfo }) => {
  const { currencyName, currencyCode, denominations } = tokenInfo
  const [denomination, write] = useDisplayDenomination(useAccount(), tokenInfo.currencyCode)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo currencyCode={currencyCode} />
        {currencyName} - {currencyCode} (token)
      </ListGroupItem>
      <Denominations denominations={denominations} onSelect={write} selectedDenomination={denomination} />
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
        onSelect={onSelect}
        isSelected={denomination.multiplier === selectedDenomination.multiplier}
      />
    ))}
  </>
)

const Denomination: React.FC<{
  denomination: EdgeDenomination
  onSelect: (denomination: EdgeDenomination) => any
  isSelected: boolean
}> = ({ denomination, onSelect, isSelected }) => (
  <ListGroupItem onClick={() => onSelect(denomination)} variant={isSelected ? 'primary' : undefined}>
    {denomination.name}, {denomination.multiplier}, {denomination.symbol}
  </ListGroupItem>
)
