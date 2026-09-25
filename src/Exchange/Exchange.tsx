import { EdgeTokenId } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Alert, Balance, Boundary, Button, Debug, DisplayAmount, FlipInput, FormControl, Logo } from '../components'
import {
  getCurrencyCodeFromTokenId,
  useApproveSwapQuote,
  useCryptoDisplayDenomination,
  useEdgeCurrencyWallet,
  useFiatCurrencyCode,
  useName,
  useSwapQuote,
} from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { getWalletListMeta } from '../utils'

type TokenChoice = {
  key: string
  walletId: string
  tokenId: EdgeTokenId
  label: string
}

const tokenIdKey = (walletId: string, tokenId: EdgeTokenId) => `${walletId}::${tokenId ?? 'native'}`

const parseTokenIdKey = (value: string) => {
  const separator = value.lastIndexOf('::')
  if (separator < 0) return undefined
  const tokenPart = value.slice(separator + 2)

  return { walletId: value.slice(0, separator), tokenId: tokenPart === 'native' ? null : tokenPart }
}

const getTokenChoices = (account: ReturnType<typeof useEdgeAccount>): TokenChoice[] =>
  account.activeWalletIds.flatMap((walletId) => {
    const meta = getWalletListMeta(account, walletId)
    const wallet = account.currencyWallets[walletId]
    const walletLabel = wallet?.name || meta.name
    const native = {
      key: tokenIdKey(walletId, null),
      walletId,
      tokenId: null as EdgeTokenId,
      label: walletLabel,
    }
    if (!wallet) return [native]

    return [
      native,
      ...wallet.enabledTokenIds.map((tokenId) => ({
        key: tokenIdKey(walletId, tokenId),
        walletId,
        tokenId,
        label: `${walletLabel} · ${getCurrencyCodeFromTokenId(account, wallet.currencyInfo.pluginId, tokenId)}`,
      })),
    ]
  })

export const Exchange = () => {
  const [{ wallet, tokenId }] = useSelectedWallet()
  const account = useEdgeAccount()
  const choices = getTokenChoices(account)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [displayDenomination] = useCryptoDisplayDenomination(wallet.currencyInfo.pluginId, tokenId)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWalletId, setFromWalletId] = React.useState(wallet.id)
  const [fromTokenId, setFromTokenId] = React.useState<EdgeTokenId>(tokenId)
  const [toWalletId, setToWalletId] = React.useState<string>()
  const [toTokenId, setToTokenId] = React.useState<EdgeTokenId>()

  const onSelectToken = (value: string, direction: 'from' | 'to') => {
    const parsed = parseTokenIdKey(value)
    if (!parsed) return

    if (direction === 'from') {
      setFromWalletId(parsed.walletId)
      setFromTokenId(parsed.tokenId)

      return
    }

    setToWalletId(parsed.walletId)
    setToTokenId(parsed.tokenId)
  }

  const swapDirection = () => {
    if (!toWalletId || toTokenId === undefined) return
    setFromWalletId(toWalletId)
    setFromTokenId(toTokenId)
    setToWalletId(fromWalletId)
    setToTokenId(fromTokenId)
  }

  return (
    <div className="exchange">
      <div className="panel-title">Exchange</div>

      <TokenCard
        label="From"
        walletId={fromWalletId}
        tokenId={fromTokenId}
        choices={choices}
        value={tokenIdKey(fromWalletId, fromTokenId)}
        onSelect={(value) => onSelectToken(value, 'from')}
      >
        <div className="exchange__amount">
          <FlipInput
            key={`${fromWalletId}-${fromTokenId ?? 'native'}`}
            onChange={setNativeAmount}
            wallet={account.currencyWallets[fromWalletId] ?? wallet}
            tokenId={fromTokenId}
            fiatCurrencyCode={fiatCurrencyCode}
          />
        </div>
      </TokenCard>

      <div className="exchange__swap">
        <Button size="sm" variant="outline-secondary" disabled={!toWalletId} onClick={swapDirection}>
          ↕
        </Button>
      </div>

      <TokenCard
        label="To"
        walletId={toWalletId}
        tokenId={toTokenId}
        choices={choices}
        value={toWalletId && toTokenId !== undefined ? tokenIdKey(toWalletId, toTokenId) : ''}
        placeholder="Select destination"
        onSelect={(value) => onSelectToken(value, 'to')}
      />

      {toWalletId && toTokenId !== undefined ? (
        <SwapQuote
          toWalletId={toWalletId}
          fromWalletId={fromWalletId}
          toTokenId={toTokenId}
          nativeAmount={nativeAmount}
          fromTokenId={fromTokenId}
        />
      ) : null}

      <Debug>
        <JSONPretty
          data={{
            nativeAmount,
            displayDenomination,
            tokenId,
            swapRequest: {
              nativeAmount,
              fromWallet: `EdgeCurrencyWallet<${fromWalletId}>`,
              fromTokenId,
              toTokenId,
            },
          }}
        />
      </Debug>
    </div>
  )
}

const TokenCard = ({
  label,
  walletId,
  tokenId,
  choices,
  value,
  placeholder,
  onSelect,
  children,
}: {
  label: string
  walletId?: string
  tokenId?: EdgeTokenId
  choices: TokenChoice[]
  value: string
  placeholder?: string
  onSelect: (value: string) => void
  children?: React.ReactNode
}) => {
  return (
    <div className="exchange-token">
      <div className="exchange-token__header">
        <div className="exchange-token__label">{label}</div>
        <FormControl
          as="select"
          className="exchange-token__select"
          value={value}
          onChange={(event) => onSelect(event.currentTarget.value)}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {choices.map((choice) => (
            <option key={choice.key} value={choice.key}>
              {choice.label}
            </option>
          ))}
        </FormControl>
      </div>

      {walletId && tokenId !== undefined ? <SelectedToken walletId={walletId} tokenId={tokenId} /> : null}
      {children}
    </div>
  )
}

const SelectedToken = ({ walletId, tokenId }: { walletId: string; tokenId: EdgeTokenId }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ walletId })
  const [name] = useName(wallet)
  const currencyCode = getCurrencyCodeFromTokenId(account, wallet.currencyInfo.pluginId, tokenId)
  const label = name || wallet.currencyInfo.displayName || wallet.currencyInfo.currencyCode

  return (
    <div className="exchange-token__selected">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo pluginId={wallet.currencyInfo.pluginId} tokenId={tokenId} />
      </Boundary>
      <div className="exchange-token__text">
        <div className="exchange-token__name">
          {label} · {currencyCode}
        </div>
        <div className="exchange-token__balance">
          <Boundary>
            <Balance wallet={wallet} tokenId={tokenId} />
          </Boundary>
        </div>
      </div>
    </div>
  )
}

const SwapQuote = ({
  fromWalletId,
  toWalletId,
  nativeAmount,
  toTokenId,
  fromTokenId,
}: {
  fromWalletId: string
  fromTokenId: EdgeTokenId
  toTokenId: EdgeTokenId
  toWalletId: string
  nativeAmount: string
}) => {
  const toWallet = useEdgeCurrencyWallet({ walletId: toWalletId })
  const fromWallet = useEdgeCurrencyWallet({ walletId: fromWalletId })
  const { swapQuote, error, isFetching } = useSwapQuote({
    nativeAmount,
    fromWallet,
    fromTokenId,
    toWallet,
    toTokenId,
  })
  const { mutate: approveQuote, isLoading, error: approveError, data: swapResult } = useApproveSwapQuote(fromWallet)

  return (
    <div className="swap-quote">
      <div className="exchange-token__label">Quote</div>
      {Number(nativeAmount) <= 0 ? <div className="swap-quote__hint">Enter an amount to fetch a quote.</div> : null}
      {isFetching ? <div className="swap-quote__hint">Fetching quote…</div> : null}
      {error ? <Alert variant="danger">{error.message}</Alert> : null}
      {swapQuote ? (
        <>
          <div className="swap-quote__provider">
            {swapQuote.swapInfo.displayName}
            {swapQuote.isEstimate ? ' (estimate)' : ''}
          </div>
          <div className="swap-quote__row">
            <span>Send</span>
            <DisplayAmount
              nativeAmount={swapQuote.fromNativeAmount}
              pluginId={fromWallet.currencyInfo.pluginId}
              tokenId={fromTokenId}
            />
          </div>
          <div className="swap-quote__row">
            <span>Receive</span>
            <DisplayAmount
              nativeAmount={swapQuote.toNativeAmount}
              pluginId={toWallet.currencyInfo.pluginId}
              tokenId={toTokenId}
            />
          </div>
          {swapQuote.networkFee?.nativeAmount ? (
            <div className="swap-quote__row">
              <span>Fee</span>
              <DisplayAmount
                nativeAmount={swapQuote.networkFee.nativeAmount}
                pluginId={fromWallet.currencyInfo.pluginId}
                tokenId={swapQuote.networkFee.tokenId}
              />
            </div>
          ) : null}
          <Button className="swap-quote__approve" disabled={isLoading} onClick={() => approveQuote(swapQuote)}>
            {isLoading ? 'Swapping…' : 'Approve'}
          </Button>
        </>
      ) : null}
      {approveError ? <Alert variant="danger">{approveError.message}</Alert> : null}
      {swapResult?.transaction.txid ? <div className="swap-quote__hint">Sent {swapResult.transaction.txid}</div> : null}
      <Debug>
        <JSONPretty json={{ swapQuote, error: error?.message }} />
      </Debug>
    </div>
  )
}
