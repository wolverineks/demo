import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Alert, Balance, Boundary, Button, Debug, DisplayAmount, FlipInput, FormControl, Logo } from '../components'
import {
  useApproveSwapQuote,
  useAssetDisplayDenomination,
  useEdgeCurrencyWallet,
  useFiatCurrencyCode,
  useName,
  useSwapQuote,
} from '../hooks'
import { getCurrencyCodeFromTokenId, getWalletListMeta } from '../utils'

type AssetChoice = {
  key: string
  walletId: string
  tokenId: EdgeTokenId
  label: string
}

const assetKey = (walletId: string, tokenId: EdgeTokenId) => `${walletId}::${tokenId ?? 'native'}`

const parseAssetKey = (value: string) => {
  const separator = value.lastIndexOf('::')
  if (separator < 0) return undefined
  const tokenPart = value.slice(separator + 2)

  return { walletId: value.slice(0, separator), tokenId: tokenPart === 'native' ? null : tokenPart }
}

const getAssetChoices = (account: ReturnType<typeof useEdgeAccount>): AssetChoice[] =>
  account.activeWalletIds.flatMap((walletId) => {
    const meta = getWalletListMeta(account, walletId)
    const wallet = account.currencyWallets[walletId]
    const walletLabel = wallet?.name || meta.name
    const native = {
      key: assetKey(walletId, null),
      walletId,
      tokenId: null as EdgeTokenId,
      label: walletLabel,
    }
    if (!wallet) return [native]

    return [
      native,
      ...wallet.enabledTokenIds.map((tokenId) => ({
        key: assetKey(walletId, tokenId),
        walletId,
        tokenId,
        label: `${walletLabel} · ${getCurrencyCodeFromTokenId(wallet, tokenId)}`,
      })),
    ]
  })

export const Exchange = ({ wallet, tokenId }: { wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }) => {
  const account = useEdgeAccount()
  const choices = getAssetChoices(account)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [displayDenomination] = useAssetDisplayDenomination(account, wallet, tokenId)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWalletId, setFromWalletId] = React.useState(wallet.id)
  const [fromTokenId, setFromTokenId] = React.useState<EdgeTokenId>(tokenId)
  const [toWalletId, setToWalletId] = React.useState<string>()
  const [toTokenId, setToTokenId] = React.useState<EdgeTokenId>()

  const onSelectAsset = (value: string, direction: 'from' | 'to') => {
    const parsed = parseAssetKey(value)
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

      <AssetCard
        label="From"
        walletId={fromWalletId}
        tokenId={fromTokenId}
        choices={choices}
        value={assetKey(fromWalletId, fromTokenId)}
        onSelect={(value) => onSelectAsset(value, 'from')}
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
      </AssetCard>

      <div className="exchange__swap">
        <Button size="sm" variant="outline-secondary" disabled={!toWalletId} onClick={swapDirection}>
          ↕
        </Button>
      </div>

      <AssetCard
        label="To"
        walletId={toWalletId}
        tokenId={toTokenId}
        choices={choices}
        value={toWalletId && toTokenId !== undefined ? assetKey(toWalletId, toTokenId) : ''}
        placeholder="Select destination"
        onSelect={(value) => onSelectAsset(value, 'to')}
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

const AssetCard = ({
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
  choices: AssetChoice[]
  value: string
  placeholder?: string
  onSelect: (value: string) => void
  children?: React.ReactNode
}) => {
  return (
    <div className="exchange-asset">
      <div className="exchange-asset__header">
        <div className="exchange-asset__label">{label}</div>
        <FormControl
          as="select"
          className="exchange-asset__select"
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

      {walletId && tokenId !== undefined ? <SelectedAsset walletId={walletId} tokenId={tokenId} /> : null}
      {children}
    </div>
  )
}

const SelectedAsset = ({ walletId, tokenId }: { walletId: string; tokenId: EdgeTokenId }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)
  const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const label = name || wallet.currencyInfo.displayName || wallet.currencyInfo.currencyCode

  return (
    <div className="exchange-asset__selected">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo currencyCode={currencyCode} pluginId={wallet.currencyInfo.pluginId} tokenId={tokenId ?? undefined} />
      </Boundary>
      <div className="exchange-asset__text">
        <div className="exchange-asset__name">
          {label} · {currencyCode}
        </div>
        <div className="exchange-asset__balance">
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
  const account = useEdgeAccount()
  const toWallet = useEdgeCurrencyWallet({ account, walletId: toWalletId })
  const fromWallet = useEdgeCurrencyWallet({ account, walletId: fromWalletId })
  const { swapQuote, error, isFetching } = useSwapQuote({
    account,
    nativeAmount,
    fromWallet,
    fromTokenId,
    toWallet,
    toTokenId,
  })
  const { mutate: approveQuote, isLoading, error: approveError, data: swapResult } = useApproveSwapQuote(fromWallet)

  return (
    <div className="swap-quote">
      <div className="exchange-asset__label">Quote</div>
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
            <DisplayAmount nativeAmount={swapQuote.fromNativeAmount} wallet={fromWallet} tokenId={fromTokenId} />
          </div>
          <div className="swap-quote__row">
            <span>Receive</span>
            <DisplayAmount nativeAmount={swapQuote.toNativeAmount} wallet={toWallet} tokenId={toTokenId} />
          </div>
          {swapQuote.networkFee?.nativeAmount ? (
            <div className="swap-quote__row">
              <span>Fee</span>
              <DisplayAmount
                nativeAmount={swapQuote.networkFee.nativeAmount}
                wallet={fromWallet}
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
