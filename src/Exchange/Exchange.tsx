import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Alert, Balance, Boundary, Button, Debug, DisplayAmount, FlipInput, FormControl, Logo } from '../components'
import {
  useApproveSwapQuote,
  useCurrencyWallets,
  useDisplayDenomination,
  useEdgeCurrencyWallet,
  useFiatCurrencyCode,
  useName,
  useSwapQuote,
} from '../hooks'
import { getCurrencyCodeFromTokenId, getSortedCurrencyWallets } from '../utils'

type AssetChoice = {
  key: string
  wallet: EdgeCurrencyWallet
  currencyCode: string
  label: string
}

const assetKey = (walletId: string, currencyCode: string) => `${walletId}::${currencyCode}`

const parseAssetKey = (value: string) => {
  const separator = value.lastIndexOf('::')
  if (separator < 0) return undefined

  return { walletId: value.slice(0, separator), currencyCode: value.slice(separator + 2) }
}

const getAssetChoices = (wallets: EdgeCurrencyWallet[]): AssetChoice[] =>
  wallets.flatMap((wallet) => {
    const walletLabel = wallet.name || wallet.currencyInfo.displayName || wallet.currencyInfo.currencyCode
    const nativeCode = wallet.currencyInfo.currencyCode
    const tokens = wallet.enabledTokenIds
      .map((tokenId) => wallet.currencyConfig.allTokens[tokenId]?.currencyCode)
      .filter((currencyCode): currencyCode is string => !!currencyCode && currencyCode !== nativeCode)

    return [
      { key: assetKey(wallet.id, nativeCode), wallet, currencyCode: nativeCode, label: walletLabel },
      ...tokens.map((currencyCode) => ({
        key: assetKey(wallet.id, currencyCode),
        wallet,
        currencyCode,
        label: `${walletLabel} · ${currencyCode}`,
      })),
    ]
  })

export const Exchange = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const account = useEdgeAccount()
  useCurrencyWallets(account)
  const wallets = getSortedCurrencyWallets(account)
  const choices = getAssetChoices(wallets)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [displayDenomination] = useDisplayDenomination(account, currencyCode)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWalletId, setFromWalletId] = React.useState(wallet.id)
  const [fromCurrencyCode, setFromCurrencyCode] = React.useState(currencyCode)
  const [toWalletId, setToWalletId] = React.useState<string>()
  const [toCurrencyCode, setToCurrencyCode] = React.useState<string>()

  const onSelectAsset = (value: string, direction: 'from' | 'to') => {
    const parsed = parseAssetKey(value)
    const nextWallet = parsed && wallets.find(({ id }) => id === parsed.walletId)
    if (!parsed || !nextWallet) return

    if (direction === 'from') {
      setFromWalletId(nextWallet.id)
      setFromCurrencyCode(parsed.currencyCode)

      return
    }

    setToWalletId(nextWallet.id)
    setToCurrencyCode(parsed.currencyCode)
  }

  const swapDirection = () => {
    if (!toWalletId || !toCurrencyCode) return
    setFromWalletId(toWalletId)
    setFromCurrencyCode(toCurrencyCode)
    setToWalletId(fromWalletId)
    setToCurrencyCode(fromCurrencyCode)
  }

  return (
    <div className="exchange">
      <div className="panel-title">Exchange</div>

      <AssetCard
        label="From"
        walletId={fromWalletId}
        currencyCode={fromCurrencyCode}
        choices={choices}
        value={assetKey(fromWalletId, fromCurrencyCode)}
        onSelect={(value) => onSelectAsset(value, 'from')}
      >
        <div className="exchange__amount">
          <FlipInput
            key={`${fromWalletId}-${fromCurrencyCode}`}
            onChange={setNativeAmount}
            currencyCode={fromCurrencyCode}
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
        currencyCode={toCurrencyCode}
        choices={choices}
        value={toWalletId && toCurrencyCode ? assetKey(toWalletId, toCurrencyCode) : ''}
        placeholder="Select destination"
        onSelect={(value) => onSelectAsset(value, 'to')}
      />

      {toWalletId && toCurrencyCode ? (
        <SwapQuote
          toWalletId={toWalletId}
          fromWalletId={fromWalletId}
          toCurrencyCode={toCurrencyCode}
          nativeAmount={nativeAmount}
          fromCurrencyCode={fromCurrencyCode}
        />
      ) : null}

      <Debug>
        <JSONPretty
          data={{
            nativeAmount,
            displayDenomination,
            currencyCodeOptions: { currencyCode },
            swapRequest: {
              nativeAmount,
              fromWallet: `EdgeCurrencyWallet<${fromWalletId}>`,
              fromCurrencyCode,
              toCurrencyCode,
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
  currencyCode,
  choices,
  value,
  placeholder,
  onSelect,
  children,
}: {
  label: string
  walletId?: string
  currencyCode?: string
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

      {walletId && currencyCode ? <SelectedAsset walletId={walletId} currencyCode={currencyCode} /> : null}
      {children}
    </div>
  )
}

const SelectedAsset = ({ walletId, currencyCode }: { walletId: string; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)
  const label = name || wallet.currencyInfo.displayName || wallet.currencyInfo.currencyCode

  return (
    <div className="exchange-asset__selected">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo currencyCode={currencyCode} pluginId={wallet.currencyInfo.pluginId} />
      </Boundary>
      <div className="exchange-asset__text">
        <div className="exchange-asset__name">
          {label} · {currencyCode}
        </div>
        <div className="exchange-asset__balance">
          <Boundary>
            <Balance wallet={wallet} currencyCode={currencyCode} />
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
  toCurrencyCode,
  fromCurrencyCode,
}: {
  fromWalletId: string
  fromCurrencyCode: string
  toCurrencyCode: string
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
    fromCurrencyCode,
    toWallet,
    toCurrencyCode,
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
            <DisplayAmount nativeAmount={swapQuote.fromNativeAmount} currencyCode={fromCurrencyCode} />
          </div>
          <div className="swap-quote__row">
            <span>Receive</span>
            <DisplayAmount nativeAmount={swapQuote.toNativeAmount} currencyCode={toCurrencyCode} />
          </div>
          {swapQuote.networkFee?.nativeAmount ? (
            <div className="swap-quote__row">
              <span>Fee</span>
              <DisplayAmount
                nativeAmount={swapQuote.networkFee.nativeAmount}
                currencyCode={getCurrencyCodeFromTokenId(fromWallet, swapQuote.networkFee.tokenId)}
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
