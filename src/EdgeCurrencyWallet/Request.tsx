import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import QRCode from 'react-qr-code'

import { useEdgeAccount } from '../auth'
import { Debug, FlipInput } from '../components'
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
        <QRCode value={data?.uri || ''} />
      </FormGroup>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      <Debug>
        <JSONPretty
          data={{
            nativeAmount,
            fiatCurrencyCode,
            displayDenomination: useDisplayDenomination(useEdgeAccount(), currencyCode)[0],
            currencyCodeOptions: { currencyCode },
            uri: data?.uri,
            receiveAddress: data?.receiveAddress,
          }}
        />
      </Debug>
    </Form>
  )
}
