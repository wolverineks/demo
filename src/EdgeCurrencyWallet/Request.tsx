import { EdgeCurrencyInfo, EdgeCurrencyWallet } from 'edge-core-js'
import QRCode from 'qrcode.react'
import React from 'react'
import { Alert, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useAccount } from '../auth'
import { Select } from '../components'
import { useDisplayDenomination, useFiatAmount, useNativeAmount } from '../hooks'
import { useFiatCurrencyCode, useReceiveAddressAndEncodeUri } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { getCurrencyCodes, getCurrencyInfoFromCurrencyCode, nativeToDenomination } from '../utils'

export const Request: React.FC = () => {
  const wallet = useSelectedWallet()

  const currencyCodes = getCurrencyCodes(wallet)
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
        <DisplayAmountInput currencyInfo={wallet.currencyInfo} nativeAmount={nativeAmount} onChange={setNativeAmount} />
        <FiatAmountDisplay wallet={wallet} nativeAmount={nativeAmount} currencyCode={currencyCode} />

        {/* <DisplayAmountDisplay wallet={wallet} fiatAmount={fiatAmount} currencyCode={currencyCode} />
        <FiatAmountInput wallet={wallet} fiatAmount={fiatAmount} onChange={setFiatAmount} /> */}

        {error && <Alert variant={'danger'}>{error.message}</Alert>}
      </FormGroup>

      <Select
        title={'requestCurrencyCode'}
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

const DisplayAmountInput = ({
  nativeAmount,
  onChange,
  currencyInfo,
}: {
  nativeAmount: string
  onChange: (nativeAmount: string) => any
  currencyInfo: EdgeCurrencyInfo
}) => {
  const [denomination] = useDisplayDenomination(useAccount(), currencyInfo)
  const displayAmount = nativeToDenomination({ denomination, nativeAmount })

  return (
    <div>
      <FormLabel>Display Amount:</FormLabel>
      <FormControl value={displayAmount} onChange={(event) => onChange(event.currentTarget.value)} />
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
  const currencyInfo = getCurrencyInfoFromCurrencyCode({ wallet, currencyCode })
  const fiatAmount = useFiatAmount(useAccount(), currencyInfo, nativeAmount, useFiatCurrencyCode(wallet))

  return (
    <div>
      <FormLabel>{useFiatCurrencyCode(wallet)}:</FormLabel>
      <FormControl readOnly value={fiatAmount?.toFixed(2) || '0.00'} />
    </div>
  )
}

// const FiatAmountInput = ({
//   wallet,
//   fiatAmount,
//   onChange,
// }: {
//   wallet: EdgeCurrencyWallet
//   fiatAmount: number
//   onChange: (fiatAmount: number) => any
// }) => {
//   return (
//     <div>
//       <FormLabel>{useFiatCurrencyCode(wallet)}:</FormLabel>
//       <FormControl
//         value={fiatAmount?.toFixed(2) || '0.00'}
//         onChange={(event) => onChange(Number(event.currentTarget.value))}
//       />
//     </div>
//   )
// }

// const DisplayAmountDisplay = ({
//   wallet,
//   fiatAmount,
//   currencyCode,
// }: {
//   wallet: EdgeCurrencyWallet
//   fiatAmount: number
//   currencyCode: string
// }) => {
//   const nativeAmount = useNativeAmount(
//     useAccount(),
//     getCurrencyInfoFromCurrencyCode({ wallet, currencyCode }),
//     useFiatCurrencyCode(wallet),
//     fiatAmount,
//   )

//   return (
//     <div>
//       <FormLabel>{currencyCode}:</FormLabel>
//       <FormControl readOnly value={nativeAmount || '0.00'} />
//     </div>
//   )
// }
