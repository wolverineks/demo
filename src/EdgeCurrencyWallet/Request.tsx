import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import { useReceiveAddressAndEncodeUri } from 'edge-react-hooks'
import QRCode from 'qrcode.react'
import * as React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { Select } from '../Components/Select'
import { useFiatAmount } from '../Fiat'
import { useCurrencyInfoFromCurrencyCode } from '../utils'
import { getCurrencyCodes } from '../utils/utils'

export const Request: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}> = ({ account, wallet }) => {
  const currencyCodes = getCurrencyCodes(wallet)
  const [nativeAmount, setNativeAmount] = React.useState('')
  const [currencyCode, setCurrencyCode] = React.useState(currencyCodes[0])
  const currencyInfo = useCurrencyInfoFromCurrencyCode({
    wallet,
    currencyCode,
  })
  const fiatAmount = useFiatAmount({
    account,
    nativeAmount,
    currencyInfo,
    toCurrencyCode: wallet.fiatCurrencyCode,
  })
  const { data, error } = useReceiveAddressAndEncodeUri(wallet, {
    nativeAmount,
    options: { currencyCode },
  })

  return (
    <Form>
      <FormGroup>
        <FormLabel>To:</FormLabel>
        <FormControl value={data?.receiveAddress.publicAddress || ''} readOnly />
      </FormGroup>

      <FormGroup>
        <FormLabel>Native Amount:</FormLabel>
        <FormControl value={nativeAmount} onChange={(event) => setNativeAmount(event.currentTarget.value)} />

        <FormLabel>Fiat:</FormLabel>
        <FormControl readOnly value={fiatAmount?.toFixed(2) || '0.00'} />

        {error && <Alert variant={'danger'}>{error.message}</Alert>}
      </FormGroup>

      <Select
        title={'CurrenyCode'}
        onSelect={(event) => setCurrencyCode(event.currentTarget.value)}
        options={currencyCodes}
        renderOption={(currencyCode) => (
          <option key={currencyCode} value={currencyCode}>
            {currencyCode}
          </option>
        )}
      />

      <FormGroup>
        <QRCode value={data?.uri || ''} />
      </FormGroup>

      {error && <Alert variant={'danger'}>{error.message}</Alert>}
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
