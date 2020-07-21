import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { Image, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { useActiveCurrencyInfos, useActiveTokenInfos, useDisplayDenomination } from '../hooks'

export const Currencies = () => {
  const currencyInfos = useActiveCurrencyInfos(useAccount())
  const tokenInfos = (useActiveTokenInfos(useAccount()) as unknown) as EdgeMetaToken[]

  console.log('qwe', { tokenInfos })

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
  const { displayName, denominations, symbolImage, currencyCode } = currencyInfo
  const [denomination, write] = useDisplayDenomination(useAccount(), currencyInfo)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Image src={symbolImage} />
        {displayName} - {currencyCode}
      </ListGroupItem>
      <Denominations denominations={denominations} onSelect={write} selectedDenomination={denomination} />
      {/* {metaTokens.map((metaToken) => (
        <TokenSetting key={metaToken.currencyCode} tokenInfo={metaToken} />
      ))} */}
    </ListGroup>
  )
}

const TokenSetting: React.FC<{ tokenInfo: EdgeMetaToken }> = ({ tokenInfo }) => {
  const { currencyName, currencyCode, denominations, symbolImage } = tokenInfo
  const [denomination, write] = useDisplayDenomination(useAccount(), tokenInfo)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Image src={symbolImage} />
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
