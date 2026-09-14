import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import {
  Alert,
  Balance,
  Boundary,
  Debug,
  DisplayAmount,
  FlipInput,
  Form,
  FormGroup,
  FormLabel,
  Logo,
} from '../components'
import { useDisplayDenomination, useEdgeCurrencyWallet, useName, useSwapQuote, useTokens } from '../hooks'
import { useFiatCurrencyCode } from '../hooks'
import { getSortedCurrencyWallets } from '../utils'

export const Exchange = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallets = getSortedCurrencyWallets(account)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [displayDenomination] = useDisplayDenomination(account, currencyCode)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWallet, setFromWallet] = React.useState(wallet)
  const [fromCurrencyCode, setFromCurrencyCode] = React.useState(currencyCode)

  const [toWalletId, setToWalletId] = React.useState<string>()
  const [toCurrencyCode, setToCurrencyCode] = React.useState<string>()

  return (
    <Form>
      <FormGroup>
        <SelectedWallet direction={'from'} walletId={fromWallet.id} currencyCode={fromCurrencyCode} />
      </FormGroup>

      <FormGroup>
        <SelectWallet
          wallets={wallets}
          onSelect={({ wallet, currencyCode }) => {
            setFromWallet(wallet)
            setFromCurrencyCode(currencyCode)
          }}
        />
      </FormGroup>

      <FormGroup>
        <FlipInput onChange={setNativeAmount} currencyCode={fromCurrencyCode} fiatCurrencyCode={fiatCurrencyCode} />
      </FormGroup>

      {toWalletId && toCurrencyCode ? (
        <FormGroup>
          <SelectedWallet direction={'to'} walletId={toWalletId} currencyCode={toCurrencyCode} />
        </FormGroup>
      ) : null}

      <br />

      <FormGroup>
        <SelectWallet
          wallets={wallets}
          onSelect={({ wallet, currencyCode }) => {
            setToWalletId(wallet.id)
            setToCurrencyCode(currencyCode)
          }}
        />
      </FormGroup>

      {toWalletId && toCurrencyCode ? (
        <SwapQuote
          toWalletId={toWalletId}
          fromWalletId={fromWallet.id}
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
              fromWallet: `EdgeCurrencyWallet<${fromWallet.id}>`,
              fromCurrencyCode,
              toCurrencyCode,
            },
          }}
        />
      </Debug>
    </Form>
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

  return (
    <FormGroup>
      <FormLabel>Quote</FormLabel>
      {Number(nativeAmount) <= 0 ? <div className="swap-quote__hint">Enter an amount to fetch a quote.</div> : null}
      {isFetching ? <div className="swap-quote__hint">Fetching quote…</div> : null}
      {error ? <Alert variant="danger">{error.message}</Alert> : null}
      {swapQuote ? (
        <div className="swap-quote">
          <div className="swap-quote__provider">
            {swapQuote.swapInfo.displayName}
            {swapQuote.isEstimate ? ' (estimate)' : ''}
          </div>
          <div>
            Send:{' '}
            <DisplayAmount nativeAmount={swapQuote.fromNativeAmount} currencyCode={fromCurrencyCode} />
          </div>
          <div>
            Receive: <DisplayAmount nativeAmount={swapQuote.toNativeAmount} currencyCode={toCurrencyCode} />
          </div>
          {swapQuote.networkFee?.nativeAmount ? (
            <div>
              Fee:{' '}
              <DisplayAmount
                nativeAmount={swapQuote.networkFee.nativeAmount}
                currencyCode={swapQuote.networkFee.currencyCode}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <Debug>
        <JSONPretty json={{ swapQuote, error: error?.message }} />
      </Debug>
    </FormGroup>
  )
}

const SelectWallet = ({
  wallets,
  onSelect,
}: {
  wallets: EdgeCurrencyWallet[]
  onSelect: ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => void
}) => {
  return (
    <>
      {wallets.map((wallet) => (
        <Form.Row key={wallet.id}>
          <WalletRow wallet={wallet} onSelect={onSelect} />
        </Form.Row>
      ))}
    </>
  )
}

const WalletRow = ({
  wallet,
  onSelect,
}: {
  wallet: EdgeCurrencyWallet
  onSelect: ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => void
}) => {
  const tokens = useTokens(wallet)
  const [name] = useName(wallet)
  const label = name || wallet.currencyInfo.displayName || wallet.currencyInfo.currencyCode

  return (
    <div>
      <div onClick={() => onSelect({ wallet, currencyCode: wallet.currencyInfo.currencyCode })}>{label}</div>
      {tokens.enabled.map((token) => (
        <div key={token} onClick={() => onSelect({ wallet, currencyCode: token })}>
          {token}
        </div>
      ))}
    </div>
  )
}

const SelectedWallet = ({
  walletId,
  currencyCode,
  direction,
}: {
  walletId: string
  currencyCode: string
  direction: 'to' | 'from'
}) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)

  return (
    <>
      <FormLabel>
        {direction === 'from' ? 'From' : 'To'}: {name}
      </FormLabel>
      <div>
        <span>
          <Logo currencyCode={currencyCode} /> {name}{' '}
          <Boundary>
            <Balance wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        </span>
      </div>
    </>
  )
}
