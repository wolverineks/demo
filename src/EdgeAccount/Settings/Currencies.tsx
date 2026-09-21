import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeDenomination, EdgeMetaToken, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import { useQuery } from 'react-query'

import { useEdgeAccount } from '../../auth'
import { Boundary, FormControl, ListGroup, ListGroupItem, Logo } from '../../components'
import {
  useActiveWalletTokenIds,
  useTokenDenominations,
  useTokenInfo,
  useDefaultFiatCurrencyCode,
  useDenominations,
  useInfo,
  useWatch,
} from '../../hooks'
import { FiatInfo, getSortedCurrencyWallets, isFiat, isToken, normalize, unique } from '../../utils'

const useWalletFiatCurrencyCodes = (account: EdgeAccount) => {
  const getWalletFiatCurrencyCodes = () =>
    unique(getSortedCurrencyWallets(account).map(({ fiatCurrencyCode }) => fiatCurrencyCode))

  const { refetch, data } = useQuery({
    queryKey: 'walletFiatCurrencyCodes',
    queryFn: () => getWalletFiatCurrencyCodes(),
  })
  useWatch(account, 'currencyWallets', () => refetch())

  return data!
}

export const Currencies: React.FC = () => {
  const account = useEdgeAccount()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const walletFiatCurrencyCodes = useWalletFiatCurrencyCodes(account)
  const fiatCodes = unique([fiatCurrencyCode, ...walletFiatCurrencyCodes])
  const walletTokenIds = useActiveWalletTokenIds(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      {fiatCodes.map((currencyCode) => (
        <FiatMatcher key={currencyCode} currencyCode={currencyCode} query={searchQuery}>
          <FiatSetting currencyCode={currencyCode} />
        </FiatMatcher>
      ))}

      {walletTokenIds.map(({ wallet, tokenId }) => (
        <TokenMatcher
          key={`${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`}
          wallet={wallet}
          tokenId={tokenId}
          query={searchQuery}
        >
          <TokenSetting wallet={wallet} tokenId={tokenId} />
        </TokenMatcher>
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

const FiatMatcher: React.FC<{ query: string; currencyCode: string }> = ({ query, currencyCode, children }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return <>{matches(query)(info) ? children : null}</>
}

const TokenMatcher: React.FC<{
  query: string
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
}> = ({ query, wallet, tokenId, children }) => {
  const info = useTokenInfo(wallet, tokenId)

  return <>{matches(query)(info) ? children : null}</>
}

const FiatSetting: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo currencyCode={info.currencyCode} />
        {isFiat(info) ? info.currencyCode : isToken(info) ? info.currencyName : info.displayName} - {info.currencyCode}
      </ListGroupItem>
      <Boundary>
        <FiatDenominations currencyCode={info.currencyCode} />
      </Boundary>
    </ListGroup>
  )
}

const TokenSetting: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const account = useEdgeAccount()
  const info = useTokenInfo(wallet, tokenId)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo
          currencyCode={info.currencyCode}
          pluginId={wallet.currencyInfo.pluginId}
          tokenId={tokenId ?? undefined}
        />
        {isToken(info) ? info.currencyName : info.displayName} - {info.currencyCode}
      </ListGroupItem>
      <Boundary>
        <TokenDenominations wallet={wallet} tokenId={tokenId} account={account} />
      </Boundary>
    </ListGroup>
  )
}

const FiatDenominations = ({ currencyCode }: { currencyCode: string }) => {
  const account = useEdgeAccount()
  const denominations = useDenominations(account, currencyCode)

  return <DenominationList denominations={denominations} />
}

const TokenDenominations = ({
  account,
  wallet,
  tokenId,
}: {
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
}) => {
  const denominations = useTokenDenominations(account, wallet, tokenId)

  return <DenominationList denominations={denominations} />
}

const DenominationList = ({
  denominations,
}: {
  denominations: {
    all: EdgeDenomination[]
    display: EdgeDenomination
    setDisplay: (multiplier: string) => unknown
  }
}) => (
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

const Denomination: React.FC<{
  denomination: EdgeDenomination
  onSelect: () => any
  isSelected: boolean
}> = ({ denomination, onSelect, isSelected }) => (
  <ListGroupItem onClick={() => onSelect()} variant={isSelected ? 'primary' : undefined}>
    {denomination.name}, {denomination.multiplier}, {denomination.symbol}
  </ListGroupItem>
)
