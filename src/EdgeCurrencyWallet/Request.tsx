import { EdgeCurrencyWallet } from 'edge-core-js'
import QRCode from 'qrcode.react'
import React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useAccount } from '../auth'
import { Boundary, DisplayAmountInput, FiatAmountDisplay, Select } from '../components'
import { useCurrencyCodes, useDenominationToNative, useDisplayDenomination } from '../hooks'
import { useFiatCurrencyCode, useReceiveAddressAndEncodeUri } from '../hooks'

export const Request: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const currencyCodes = useCurrencyCodes(wallet)
  const [displayAmount, setDisplayAmount] = React.useState('0')
  // const [fiatAmount, setFiatAmount] = React.useState(0)
  const [currencyCode, setCurrencyCode] = React.useState(currencyCodes[0])
  const nativeAmount = useDenominationToNative({
    account: useAccount(),
    currencyCode,
    amount: displayAmount,
  })
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const { data, error } = useReceiveAddressAndEncodeUri({ wallet, nativeAmount, options: { currencyCode } })

  return (
    <Form>
      <FormGroup>
        <FormLabel>To:</FormLabel>
        <FormControl value={data?.receiveAddress.publicAddress || ''} readOnly />
      </FormGroup>

      <FormGroup>
        <Boundary>
          <DisplayAmountInput displayAmount={displayAmount} onChange={setDisplayAmount} currencyCode={currencyCode} />
        </Boundary>

        <Boundary>
          <FiatAmountDisplay
            fiatCurrencyCode={fiatCurrencyCode}
            nativeAmount={nativeAmount}
            currencyCode={currencyCode}
          />
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
        data={{
          displayAmount: String(displayAmount),
          nativeAmount,
          displayDenomination: useDisplayDenomination(useAccount(), currencyCode)[0],
          currencyCodeOptions: { currencyCode },
          uri: data?.uri,
          receiveAddress: data?.receiveAddress,
        }}
      />
    </Form>
  )
}
