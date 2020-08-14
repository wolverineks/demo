import { EdgeCurrencyWallet } from 'edge-core-js'
import QRCode from 'qrcode.react'
import React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useAccount } from '../auth'
import { Boundary, FlipInput } from '../components'
import { useDisplayDenomination } from '../hooks'
import { useFiatCurrencyCode, useReceiveAddressAndEncodeUri } from '../hooks'

export const Request: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const { data, error } = useReceiveAddressAndEncodeUri({ wallet, nativeAmount, options: { currencyCode } })

  return (
    <Form>
      <FormGroup>
        <FormLabel>To:</FormLabel>
        <FormControl value={data?.receiveAddress.publicAddress || ''} readOnly />
      </FormGroup>

      <FormGroup>
        <FlipInput onChange={setNativeAmount} currencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
      </FormGroup>

      <FormGroup>
        <Boundary>
          <QRCode value={data?.uri || ''} />
        </Boundary>
      </FormGroup>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      <JSONPretty
        data={{
          nativeAmount,
          fiatCurrencyCode,
          displayDenomination: useDisplayDenomination(useAccount(), currencyCode)[0],
          currencyCodeOptions: { currencyCode },
          uri: data?.uri,
          receiveAddress: data?.receiveAddress,
        }}
      />
    </Form>
  )
}
