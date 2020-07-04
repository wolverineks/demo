import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Image, ListGroup, ListGroupItem } from 'react-bootstrap'

import { getActiveCurrencyInfos, useDisplayDenomination } from '../utils'

export const Currencies = ({ account }: { account: EdgeAccount }) => {
  useWatchAll(account)
  const currencyInfos = getActiveCurrencyInfos(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      {currencyInfos.map((currencyInfo) => (
        <React.Suspense fallback={<div>Currency loading...</div>} key={currencyInfo.currencyCode}>
          <CurrencySetting currencyInfo={currencyInfo} account={account} />
        </React.Suspense>
      ))}
    </ListGroup>
  )
}

const CurrencySetting: React.FC<{
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo
}> = ({ account, currencyInfo }) => {
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
        <TokenSetting key={metaToken.currencyCode} account={account} tokenInfo={metaToken} />
      ))}
    </ListGroup>
  )
}

const TokenSetting: React.FC<{
  account: EdgeAccount
  tokenInfo: EdgeMetaToken
}> = ({ account, tokenInfo }) => {
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
