import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Form, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Balance, Boundary, Debug, FlipInput, Logo } from '../components'
import { useDisplayDenomination, useEdgeCurrencyWallet, useEnabledTokens, useName, useSwapQuote } from '../hooks'
import { useFiatCurrencyCode } from '../hooks'
import { getSortedCurrencyWallets } from '../utils'

export const Exchange = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallets = getSortedCurrencyWallets(account)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fromWallet, setFromWallet] = React.useState(wallet)
  const [fromCurrencyCode, setFromCurrencyCode] = React.useState(currencyCode)

  const [toWalletId, setToWalletId] = React.useState<string>()
  const [toCurrencyCode, setToCurrencyCode] = React.useState<string>()

  return (
    <Form>
      <FormGroup>
        <FromWallet walletId={fromWallet.id} currencyCode={fromCurrencyCode} />
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
          <ToWallet walletId={toWalletId} currencyCode={toCurrencyCode} />
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
            displayDenomination: useDisplayDenomination(account, currencyCode)[0],
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
  const { swapQuote, error } = useSwapQuote({
    account,
    nativeAmount,
    fromWallet,
    fromCurrencyCode,
    toWallet,
    toCurrencyCode,
  })

  return (
    <Debug>
      <div>
        {swapQuote ? <JSONPretty json={swapQuote} /> : null}
        {error ? <div>{error.message}</div> : null}
      </div>
    </Debug>
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
  const [name] = useName(wallet)

  return (
    <div>
      <div onClick={() => onSelect({ wallet, currencyCode: wallet.currencyInfo.currencyCode })}>{name}</div>
      {enabledTokens.map((token) => (
        <div key={token} onClick={() => onSelect({ wallet, currencyCode: token })}>
          {token}
        </div>
      ))}
    </div>
  )
}

const FromWallet = ({ walletId, currencyCode }: { walletId: string; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)

  return (
    <>
      <FormLabel>From: {name}</FormLabel>
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

const ToWallet = ({ walletId, currencyCode }: { walletId: string; currencyCode: string }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)

  return (
    <>
      <FormLabel>To: {name} </FormLabel>
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
