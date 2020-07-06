import { EdgeCurrencyCodeOptions, EdgeCurrencyWallet } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import QRCode from 'qrcode.react'
import * as React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import { useQuery } from 'react-query'

import { useAccount } from '../Auth'
import { Select } from '../Components/Select'
import { useFiatAmount } from '../Fiat'
import { getCurrencyInfoFromCurrencyCode } from '../utils'
import { getCurrencyCodes } from '../utils/utils'

const useReceiveAddressAndEncodeUri = ({
  wallet,
  nativeAmount,
  options,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  options?: EdgeCurrencyCodeOptions
}) =>
  useQuery({
    queryKey: ['receiveAddressAndEncodeUri', wallet.id, nativeAmount, options],
    queryFn: () => {
      const receiveAddress = wallet.getReceiveAddress({ currencyCode: options?.currencyCode })
      const encodeUri = receiveAddress.then(({ publicAddress }) =>
        wallet.encodeUri({
          publicAddress,
          nativeAmount: nativeAmount || '0',
        }),
      )

      return Promise.all([receiveAddress, encodeUri]).then(([receiveAddress, uri]) => ({ receiveAddress, uri }))
    },
    config: { staleTime: Infinity, cacheTime: 0, suspense: false },
  })

export const Request: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const account = useAccount()
  useWatchAll(wallet)

  const currencyCodes = getCurrencyCodes(wallet)
  const [nativeAmount, setNativeAmount] = React.useState('')
  const [currencyCode, setCurrencyCode] = React.useState(currencyCodes[0])
  const currencyInfo = getCurrencyInfoFromCurrencyCode({
    wallet,
    currencyCode,
  })
  const fiatAmount = useFiatAmount({
    account,
    nativeAmount,
    currencyInfo,
    toCurrencyCode: wallet.fiatCurrencyCode,
  })
  const { data, error } = useReceiveAddressAndEncodeUri({ wallet, nativeAmount, options: { currencyCode } })

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
