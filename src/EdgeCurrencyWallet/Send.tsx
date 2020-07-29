import { EdgeCurrencyWallet, EdgeParsedUri, EdgeSpendInfo } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import QrReader from 'react-qr-reader'

import { useAccount } from '../auth'
import { Boundary, Select } from '../components'
import {
  useCurrencyCodes,
  useDisplayAmount,
  useFiatAmount,
  useFiatCurrencyCode,
  useMaxSpendable,
  useNewTransaction,
} from '../hooks'
import { categories, denominationToNative } from '../utils'

export const Send: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const currencyCodes = useCurrencyCodes(wallet)
  const [parsedUri, setParsedUri] = React.useState<EdgeParsedUri>()
  const [currencyCode, setCurrencyCode] = React.useState(wallet.currencyInfo.currencyCode)
  const [publicAddress, setPublicAddress] = React.useState('')
  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [name, setName] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [category, setCategory] = React.useState('')

  const spendInfo: EdgeSpendInfo = React.useMemo(
    () => ({
      metadata: { name, notes, category },
      currencyCode,
      spendTargets: [{ publicAddress, nativeAmount }],
    }),
    [publicAddress, nativeAmount, currencyCode, name, notes, category],
  )

  const { data: maxSpendable } = useMaxSpendable(wallet, spendInfo)

  const [scan, setScan] = React.useState(false)
  const onScan = (uri: string) =>
    wallet
      .parseUri(uri, currencyCode)
      .then((parsedUri: EdgeParsedUri) => {
        setParsedUri(parsedUri)
        setPublicAddress(parsedUri.publicAddress || '')
        setNativeAmount(parsedUri.nativeAmount || '')
        setCurrencyCode(parsedUri.currencyCode || '')
        setName(parsedUri.metadata?.name || '')
        setNotes(parsedUri.metadata?.notes || '')
        setCategory(parsedUri.metadata?.category || '')
      })
      .catch((error: Error) => console.log(error))

  const { data: transaction, error } = useNewTransaction(wallet, spendInfo)

  return (
    <div>
      <Form>
        <FormGroup>
          <FormLabel>To:</FormLabel>
          <InputGroup>
            <FormControl value={publicAddress} onChange={(event) => setPublicAddress(event.currentTarget.value)} />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={() => setPublicAddress(parsedUri?.publicAddress || '')}>
                Reset
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup>
            <Boundary>
              <DisplayAmountInput nativeAmount={nativeAmount} onChange={setNativeAmount} currencyCode={currencyCode} />
              <Button variant="outline-secondary" onClick={() => setNativeAmount(parsedUri?.nativeAmount || '')}>
                Reset
              </Button>
            </Boundary>
          </InputGroup>

          <InputGroup>
            <Boundary>
              <FiatAmountDisplay wallet={wallet} nativeAmount={nativeAmount} currencyCode={currencyCode} />
            </Boundary>
          </InputGroup>
        </FormGroup>

        <Select
          title={'CurrencyCode'}
          id={'sendCurrencyCode'}
          onSelect={(event) => setCurrencyCode(event.currentTarget.value)}
          options={currencyCodes}
          renderOption={(currencyCode: string) => (
            <option key={currencyCode} value={currencyCode}>
              {currencyCode}
            </option>
          )}
        />

        <FormGroup>
          <FormLabel>Name</FormLabel>
          <FormControl value={name} onChange={(event) => setName(event.currentTarget.value)} />
        </FormGroup>

        <FormGroup>
          <FormLabel>Note</FormLabel>
          <FormControl as={'textarea'} value={notes} onChange={(event) => setNotes(event.currentTarget.value)} />
        </FormGroup>

        <Select
          title={'Category'}
          onSelect={(event) => setCategory(event.currentTarget.value)}
          options={[{ value: 'none', display: '-' }, ...categories]}
          renderOption={(category) => (
            <option value={category.value} key={category.value}>
              {category.display}
            </option>
          )}
        />

        {error && <Alert>{error.message}</Alert>}
      </Form>

      <Button onClick={() => setScan((scan) => !scan)}>Scan</Button>

      {scan && <Scanner onScan={!parsedUri ? onScan : () => undefined} show={!parsedUri} />}

      <JSONPretty
        data={{
          parsedUri: parsedUri || 'undefined',
          nativeAmount: String(nativeAmount),
          currencyCode: String(currencyCode),
          publicAddress: String(publicAddress),
          spendInfo: spendInfo || 'undefined',
          maxSpendable: String(maxSpendable),
          transaction: transaction || 'undefined',
        }}
      />
    </div>
  )
}

const Scanner: React.FC<{ onScan: (data: string) => any; show: boolean }> = ({ onScan, show }) => {
  const [error, setError] = React.useState<Error>()

  return show ? (
    <div>
      {error && <Alert variant={'danger'}>{error.message}</Alert>}

      <QrReader delay={300} onError={setError} onScan={(data) => onScan(data || '')} style={{ width: '50%' }} />
    </div>
  ) : null
}

const DisplayAmountInput = ({
  onChange,
  currencyCode,
  nativeAmount,
}: {
  onChange: (nativeAmount: string) => any
  currencyCode: string
  nativeAmount: string
}) => {
  const { amount, symbol, denomination, name } = useDisplayAmount({ account: useAccount(), nativeAmount, currencyCode })

  return (
    <div>
      <FormLabel>
        Display Amount: {symbol} {name}
      </FormLabel>
      <FormControl
        value={amount}
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
    fiatCurrencyCode,
    nativeAmount,
    fromCurrencyCode: currencyCode,
  })

  return (
    <div>
      <FormLabel>{fiatCurrencyCode}:</FormLabel>
      <FormControl readOnly value={fiatAmount.toFixed(2) || '0.00'} />
    </div>
  )
}
