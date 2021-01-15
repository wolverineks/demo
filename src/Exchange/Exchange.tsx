import { EdgeAccount, EdgeCurrencyWallet, EdgeSwapQuote, EdgeTransaction } from 'edge-core-js'
import React from 'react'
import { Form, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import { useQuery } from 'react-query'

import { useEdgeAccount } from '../auth'
import { Balance, Boundary, Debug, FlipInput, Logo } from '../components'
import { useDisplayDenomination, useEnabledTokens } from '../hooks'
import { useFiatCurrencyCode } from '../hooks'
import { getSortedCurrencyWallets } from '../utils'

export interface EdgeSwapRequest {
  fromWallet: EdgeCurrencyWallet
  toWallet: EdgeCurrencyWallet
  fromCurrencyCode: string
  toCurrencyCode: string
  nativeAmount: string
  quoteFor: 'from' | 'to'
}

export interface EdgeSwapResult {
  readonly orderId?: string
  readonly destinationAddress?: string
  readonly transaction: EdgeTransaction
}

const useFetchSwapQuote = ({
  account,
  nativeAmount,
  fromWallet,
  fromCurrencyCode,
  toWallet,
  toCurrencyCode,
}: {
  account: EdgeAccount
  nativeAmount: string
  fromWallet: EdgeCurrencyWallet
  fromCurrencyCode: string
  toWallet: EdgeCurrencyWallet | undefined
  toCurrencyCode: string | undefined
}) => {
  const swapRequest = {
    fromWallet,
    fromCurrencyCode,
    nativeAmount,

    quoteFor: 'to',

    toWallet,
    toCurrencyCode,
  } as EdgeSwapRequest

  const { data: swapQuote, ...rest } = useQuery<EdgeSwapQuote, Error>(
    [
      {
        nativeAmount,
        fromWalletId: fromWallet.id,
        fromCurrencyCode,
        toWalletId: toWallet?.id,
        toCurrencyCode,
      },
    ],
    () => account.fetchSwapQuote(swapRequest as EdgeSwapRequest),
    { enabled: !!toWallet && !!toCurrencyCode, useErrorBoundary: false, suspense: false, cacheTime: 0 },
  )

  return {
    swapQuote,
    ...rest,
  }
}

export const Exchange = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallets = getSortedCurrencyWallets(account)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWallet, setFromWallet] = React.useState(wallet)
  const [fromCurrencyCode, setFromCurrencyCode] = React.useState(currencyCode)
  const [toWallet, setToWallet] = React.useState<EdgeCurrencyWallet>()
  const [toCurrencyCode, setToCurrencyCode] = React.useState<string>()

  const { swapQuote, error } = useFetchSwapQuote({
    account,
    nativeAmount,
    fromWallet,
    fromCurrencyCode,
    toWallet,
    toCurrencyCode,
  })

  return (
    <Form>
      <FormGroup>
        <FormLabel>From: {wallet.name}</FormLabel>
        <div>
          <span>
            <Logo currencyCode={fromCurrencyCode} /> {fromWallet.name}{' '}
            <Boundary>
              <Balance wallet={fromWallet} currencyCode={fromCurrencyCode} />
            </Boundary>
          </span>
        </div>
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

      {toWallet && toCurrencyCode ? (
        <FormGroup>
          <FormLabel>To: {toWallet.name} </FormLabel>
          <div>
            <span>
              <Logo currencyCode={toCurrencyCode} /> {toWallet.name}{' '}
              <Boundary>
                <Balance wallet={toWallet} currencyCode={toCurrencyCode} />
              </Boundary>
            </span>
          </div>
        </FormGroup>
      ) : null}

      <br />

      <FormGroup>
        <SelectWallet
          wallets={wallets}
          onSelect={({ wallet, currencyCode }) => {
            setToWallet(wallet)
            setToCurrencyCode(currencyCode)
          }}
        />
      </FormGroup>

      {error ? <div>{error.message}</div> : null}

      <Debug>
        <JSONPretty
          data={{
            nativeAmount,
            displayDenomination: useDisplayDenomination(account, currencyCode)[0],
            currencyCodeOptions: { currencyCode },
            swapRequest: {
              nativeAmount,
              fromWallet: `EdgeCurrencyWallet<${fromWallet.id}>`,
              fromCurrencyCode,
              toWallet: toWallet ? `EdgeCurrencyWallet<${toWallet.id}>` : '',
              toCurrencyCode,
            },
            swapQuote,
          }}
        />
      </Debug>
    </Form>
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
  const enabledTokens = useEnabledTokens(wallet)

  return (
    <div>
      <div onClick={() => onSelect({ wallet, currencyCode: wallet.currencyInfo.currencyCode })}>{wallet.name}</div>
      {enabledTokens.map((token) => (
        <div key={token} onClick={() => onSelect({ wallet, currencyCode: token })}>
          {token}
        </div>
      ))}
    </div>
  )
}
