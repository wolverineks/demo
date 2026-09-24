import {
  EdgeAccount,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeMetaToken,
  EdgeTokenId,
} from 'edge-core-js'
import React from 'react'
import { useQuery } from 'react-query'

import { useEdgeAccount } from '../../auth'
import { Boundary, FiatLogo, FormControl, ListGroup, ListGroupItem, Logo } from '../../components'
import {
  useDefaultFiatCurrencyCode,
  getFiatInfo,
  useCryptoInfo,
  useDenominations,
  useTokenDenominations,
  useWatch,
} from '../../hooks'
import { FiatInfo, getSortedCurrencyWallets, getWalletTokenIds, isFiat, isToken, normalize, unique } from '../../utils'

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
  useWatch(account, 'activeWalletIds')
  useWatch(account, 'currencyWallets')

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      {fiatCodes.map((currencyCode) => (
        <FiatMatcher key={currencyCode} currencyCode={currencyCode} query={searchQuery}>
          <FiatSetting currencyCode={currencyCode} />
        </FiatMatcher>
      ))}

      {Object.values(account.currencyWallets).map((wallet) => (
        <WalletTokens key={wallet.id} wallet={wallet} searchQuery={searchQuery} />
      ))}
    </ListGroup>
  )
}

const WalletTokens: React.FC<{ wallet: EdgeCurrencyWallet; searchQuery: string }> = ({ wallet, searchQuery }) => {
  useWatch(wallet, 'enabledTokenIds')

  return (
    <>
      {getWalletTokenIds(wallet).map((tokenId) => (
        <TokenMatcher key={`${wallet.id}:${tokenId ?? 'native'}`} wallet={wallet} tokenId={tokenId} query={searchQuery}>
          <TokenSetting wallet={wallet} tokenId={tokenId} />
        </TokenMatcher>
      ))}
    </>
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
  const info = getFiatInfo(currencyCode)
  if (!info) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return <>{normalize(info.currencyCode).includes(normalize(query)) ? children : null}</>
}

const TokenMatcher: React.FC<{
  query: string
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
}> = ({ query, wallet, tokenId, children }) => {
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, wallet.currencyInfo.pluginId, tokenId)

  return <>{matches(query)(info) ? children : null}</>
}

const FiatSetting: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const info = getFiatInfo(currencyCode)
  if (!info) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <FiatLogo fiatCurrencyCode={info.currencyCode} />
        {info.currencyCode} - {info.currencyCode}
      </ListGroupItem>
      <Boundary>
        <FiatDenominations currencyCode={info.currencyCode} />
      </Boundary>
    </ListGroup>
  )
}

const TokenSetting: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, wallet.currencyInfo.pluginId, tokenId)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Logo pluginId={wallet.currencyInfo.pluginId} tokenId={tokenId} />
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
  const info = getFiatInfo(currencyCode)
  if (!info) throw new Error(`Invalid Currency Code: ${currencyCode}`)
  const denominations = useDenominations(account, info)

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
