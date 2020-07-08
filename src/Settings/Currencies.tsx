import { EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'
import { Image, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { useDisplayDenomination } from '../hooks'
import { getActiveCurrencyInfos } from '../utils'

export const Currencies = () => {
  const account = useAccount()
  const currencyInfos = getActiveCurrencyInfos(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      {currencyInfos.map((currencyInfo) => (
        <React.Suspense fallback={<div>Currency loading...</div>} key={currencyInfo.currencyCode}>
          <CurrencySetting currencyInfo={currencyInfo} />
        </React.Suspense>
      ))}
    </ListGroup>
  )
}

const CurrencySetting: React.FC<{
  currencyInfo: EdgeCurrencyInfo
}> = ({ currencyInfo }) => {
  const account = useAccount()
  const { displayName, denominations, symbolImage, currencyCode, metaTokens } = currencyInfo
  const [denomination, write] = useDisplayDenomination({
    account,
    currencyInfo,
  })

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Image src={symbolImage} />
        {displayName} - {currencyCode}
      </ListGroupItem>
      <Denominations denominations={denominations} onSelect={write} selectedDenomination={denomination} />
      {metaTokens.map((metaToken) => (
        <TokenSetting key={metaToken.currencyCode} tokenInfo={metaToken} />
      ))}
    </ListGroup>
  )
}

const TokenSetting: React.FC<{
  tokenInfo: EdgeMetaToken
}> = ({ tokenInfo }) => {
  const account = useAccount()
  const { currencyName, currencyCode, denominations, symbolImage } = tokenInfo
  const [denomination, write] = useDisplayDenomination({
    account,
    currencyInfo: tokenInfo,
  })

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
