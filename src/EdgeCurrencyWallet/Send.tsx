import { EdgeCurrencyWallet, EdgeParsedUri, EdgeSpendInfo } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import QrReader from 'react-qr-scanner'

import { useEdgeAccount } from '../auth'
import { FlipInput, Select } from '../components'
import {
  useDisplayDenomination,
  useFiatCurrencyCode,
  useMaxSpendable,
  useNativeToDisplay,
  useNewTransaction,
} from '../hooks'
import { categories } from '../utils'

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const account = useEdgeAccount()
  const [parsedUri, setParsedUri] = React.useState<EdgeParsedUri>()
  const [publicAddress, setPublicAddress] = React.useState('')
  const [displayAmount, setDisplayAmount] = React.useState('0')
  const [name, setName] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [category, setCategory] = React.useState('')

  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [nativeAmount, setNativeAmount] = React.useState('0')
  const parsedUriDisplayAmount = useNativeToDisplay({
    account,
    nativeAmount: parsedUri?.nativeAmount || '0',
    currencyCode: currencyCode,
  })
  const spendInfo: EdgeSpendInfo = React.useMemo(
    () => ({
      metadata: { name, notes, category },
      currencyCode: currencyCode,
      spendTargets: [{ publicAddress, nativeAmount }],
    }),
    [name, notes, category, currencyCode, publicAddress, nativeAmount],
  )
  const { data: maxSpendable } = useMaxSpendable(wallet, spendInfo)

  // const [scan, setScan] = React.useState(false)
  // const onScan = (uri: string) =>
  //   wallet
  //     .parseUri(uri, currencyCode)
  //     .then((parsedUri: EdgeParsedUri) => {
  //       setParsedUri(parsedUri)
  //       setPublicAddress(parsedUri.publicAddress || '')
  //       setDisplayAmount(parsedUriDisplayAmount || '')
  //       setCurrencyCode(parsedUri.currencyCode || '')
  //       setName(parsedUri.metadata?.name || '')
  //       setNotes(parsedUri.metadata?.notes || '')
  //       setCategory(parsedUri.metadata?.category || '')
  //     })
  //     .catch((error: Error) => console.log(error))

  const { data: transaction, error } = useNewTransaction(wallet, spendInfo, { enabled: !!publicAddress })

  const onConfirm = () => {
    if (!transaction) return

    wallet
      .signTx(transaction)
      .then(() => wallet.broadcastTx(transaction))
      .then(() => wallet.saveTx(transaction))
  }

  return (
    <Form>
      <FormGroup>
        <FormLabel>To:</FormLabel>
        <InputGroup>
          <FormControl value={publicAddress} onChange={(event) => setPublicAddress(event.currentTarget.value)} />
          {/* <InputGroup.Append>
            <Button variant="outline-secondary" onClick={() => setPublicAddress(parsedUri?.publicAddress || '')}>
              Reset
            </Button>
          </InputGroup.Append> */}
        </InputGroup>
      </FormGroup>

      <FormGroup>
        <FlipInput currencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} onChange={setNativeAmount} />
      </FormGroup>

      <FormGroup>
        <FormLabel>Name</FormLabel>
        <FormControl value={name} onChange={(event) => setName(event.currentTarget.value)} />
      </FormGroup>

      <FormGroup>
        <FormLabel>Notes</FormLabel>
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

      {error && <Alert>{(error as Error).message}</Alert>}

      <Button disabled={!transaction} onClick={() => onConfirm()}>
        Confirm
      </Button>

      {/* <Button onClick={() => setScan((scan) => !scan)}>Scan</Button> */}

      {/* {scan && <Scanner onScan={!parsedUri ? onScan : () => undefined} show={!parsedUri} />} */}

      <JSONPretty
        data={{
          displayAmount: String(displayAmount),
          displayDenomination: useDisplayDenomination(account, currencyCode)[0],
          nativeAmount: String(nativeAmount),
          fiatCurrencyCode,
          parsedUri: String(parsedUri),
          parsedUriDisplayAmount: String(parsedUriDisplayAmount),
          currencyCode: String(currencyCode),
          publicAddress: String(publicAddress),
          spendInfo: spendInfo,
          maxSpendable: String(maxSpendable),
          transaction: String(transaction),
        }}
      />
    </Form>
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
