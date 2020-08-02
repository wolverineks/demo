import { EdgeCurrencyWallet } from 'edge-core-js'
import QRCode from 'qrcode.react'
import React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useAccount } from '../auth'
import { Boundary, Select } from '../components'
import { useCurrencyCodes, useDisplayDenomination, useFiatAmount } from '../hooks'
import { useFiatCurrencyCode, useReceiveAddressAndEncodeUri } from '../hooks'
import { denominationToNative } from '../utils'

export const Request: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const currencyCodes = useCurrencyCodes(wallet)
  const [nativeAmount, setNativeAmount] = React.useState('0')
  // const [fiatAmount, setFiatAmount] = React.useState(0)
  const [currencyCode, setCurrencyCode] = React.useState(currencyCodes[0])

  const { data, error } = useReceiveAddressAndEncodeUri(wallet, nativeAmount, { currencyCode })

  return (
    <Form>
      <FormGroup>
        <FormLabel>To:</FormLabel>
        <FormControl value={data?.receiveAddress.publicAddress || ''} readOnly />
      </FormGroup>

      <FormGroup>
        <Boundary>
          <DisplayAmountInput currencyCode={currencyCode} onChange={setNativeAmount} />
        </Boundary>

        <Boundary>
          <FiatAmountDisplay wallet={wallet} nativeAmount={nativeAmount} currencyCode={currencyCode} />
        </Boundary>

        {/* <DisplayAmountDisplay wallet={wallet} fiatAmount={fiatAmount} currencyCode={currencyCode} />
        <FiatAmountInput wallet={wallet} fiatAmount={fiatAmount} onChange={setFiatAmount} /> */}

        {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      </FormGroup>

      <Select
        title={'CurrencyCode'}
        id={'requestCurrencyCode'}
        onSelect={(event) => setCurrencyCode(event.currentTarget.value)}
        options={currencyCodes}
        renderOption={(currencyCode) => (
          <option key={currencyCode} value={currencyCode}>
            {currencyCode}
          </option>
        )}
      />

      <FormGroup>
        <Boundary>
          <QRCode value={data?.uri || ''} />
        </Boundary>
      </FormGroup>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      <JSONPretty
        json={{
          nativeAmount,
          currencyCodeOptions: { currencyCode },
          uri: data?.uri,
          receiveAddress: data?.receiveAddress,
        }}
      />
    </Form>
  )
}

const DisplayAmountInput = ({
  onChange,
  currencyCode,
}: {
  onChange: (nativeAmount: string) => any
  currencyCode: string
}) => {
  const [denomination] = useDisplayDenomination(useAccount(), currencyCode)
  const { symbol, name } = denomination

  return (
    <div>
      <FormLabel>
        Display Amount: {symbol} {name}
      </FormLabel>
      <FormControl
        onChange={(event) => onChange(denominationToNative({ denomination, amount: event.currentTarget.value }))}
      />
    </div>
  )
}

const FiatAmountDisplay = ({
  wallet,
  nativeAmount,
  currencyCode,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  currencyCode: string
}) => {
  const account = useAccount()
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const fiatAmount = useFiatAmount({
    account,
    nativeAmount,
    fiatCurrencyCode,
    fromCurrencyCode: currencyCode,
  })

  return (
    <div>
      <FormLabel>{fiatCurrencyCode}:</FormLabel>
      <FormControl readOnly value={fiatAmount?.toFixed(2) || '0.00'} />
    </div>
  )
}
