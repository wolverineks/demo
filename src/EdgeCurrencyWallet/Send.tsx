import { EdgeCurrencyWallet, EdgeParsedUri, EdgeSpendInfo, EdgeSpendTarget, EdgeTransaction } from 'edge-core-js'
import * as React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import QrReader from 'react-qr-scanner'

import { useEdgeAccount } from '../auth'
import { Debug, DisplayAmount, FlipInput, FlipInputRef, Select } from '../components'
import { useDisplayDenomination, useFiatCurrencyCode, useMaxSpendable, useNewTransaction } from '../hooks'
import { categories } from '../utils'

const UNIQUE_IDENTIFIER_CURRENCIES = ['BNB', 'EOS', 'TLOS', 'XLM', 'XRP']
const MULTIPLE_TARGETs_CURRENCIES = ['BCH', 'BTC', 'BSV']

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const account = useEdgeAccount()
  const [parsedUri, setParsedUri] = React.useState<EdgeParsedUri>()
  const [publicAddress, setPublicAddress] = React.useState('')
  const [name, setName] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [networkFeeOption, setNetworkFeeOption] = React.useState<EdgeTransaction['networkFeeOption']>('standard')

  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const [scan, setScan] = React.useState(false)
  const onScan = (uri: string) =>
    wallet
      .parseUri(uri, currencyCode)
      .then((parsedUri: EdgeParsedUri) => {
        setParsedUri(parsedUri)
        setPublicAddress(parsedUri.publicAddress || '')
        // setCurrencyCode(parsedUri.currencyCode || '')
        setName(parsedUri.metadata?.name || '')
        setNotes(parsedUri.metadata?.notes || '')
        setCategory(parsedUri.metadata?.category || '')
      })
      .catch((error: Error) => console.log(error))

  const { updateTarget, addTarget, removeTarget, spendTargets } = useSpendTargets()
  const spendInfo: EdgeSpendInfo = {
    metadata: { name, notes, category },
    currencyCode,
    spendTargets,
    networkFeeOption,
  }
  const maxSpendable = useMaxSpendable(wallet, spendInfo)
  const { data: transaction, error } = useNewTransaction(wallet, spendInfo, {
    enabled: !!spendInfo.spendTargets[0].publicAddress && !!Number(spendInfo.spendTargets[0].nativeAmount),
  })

  const onConfirm = () => {
    if (!transaction) return

    Promise.resolve(transaction).then(wallet.signTx).then(wallet.broadcastTx).then(wallet.saveTx)
  }

  const flipInputRef = React.useRef<FlipInputRef>(null)

  return (
    <Form>
      {spendTargets.map((_, index) => (
        <div key={index}>
          {index !== 0 ? <Button onClick={() => removeTarget(index)}>X</Button> : null}
          <SpendTarget
            currencyCode={currencyCode}
            fiatCurrencyCode={fiatCurrencyCode}
            onChange={(spendTarget) => updateTarget(index, spendTarget)}
            _ref={index === 0 ? flipInputRef : undefined}
          />
        </div>
      ))}

      <Matcher query={currencyCode} matchers={MULTIPLE_TARGETs_CURRENCIES}>
        <FormGroup>
          <Button onClick={addTarget}>Add another output</Button>
        </FormGroup>
      </Matcher>

      {spendTargets.length === 1 ? (
        <Button onClick={() => flipInputRef.current?.setNativeAmount(maxSpendable)}>Spend Max</Button>
      ) : null}

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

      <Select
        title={'Fee Option'}
        onSelect={(event) => setNetworkFeeOption(event.currentTarget.value)}
        options={[
          { value: 'high', display: 'high' },
          { value: 'standard', display: 'standard' },
          { value: 'low', display: 'low' },
        ]}
        defaultValue={'standard'}
        renderOption={(category) => (
          <option value={category.value} key={category.value}>
            {category.display}
          </option>
        )}
      />

      {transaction?.networkFee ? <Fee transaction={transaction} /> : null}

      {error && <Alert>{(error as Error).message}</Alert>}

      <Button disabled={!transaction} onClick={() => onConfirm()}>
        Confirm
      </Button>

      <Button onClick={() => setScan((scan) => !scan)}>Scan</Button>

      {scan && <Scanner onScan={!parsedUri ? onScan : () => undefined} show={!parsedUri} />}

      <Debug>
        <JSONPretty
          data={{
            error,
            spendTargets,
            displayDenomination: useDisplayDenomination(account, currencyCode)[0],
            fiatCurrencyCode,
            parsedUri: parsedUri,
            currencyCode: String(currencyCode),
            publicAddress: String(publicAddress),
            spendInfo: spendInfo,
            maxSpendable: String(maxSpendable),
            transaction: transaction || 'undefined',
          }}
        />
      </Debug>
    </Form>
  )
}

const Fee = ({ transaction }: { transaction: EdgeTransaction }) => {
  return (
    <div>
      fee: <DisplayAmount nativeAmount={transaction.networkFee} currencyCode={transaction.currencyCode} />
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

const Matcher: React.FC<{ query: string; matchers: string[] }> = ({ children, query, matchers }) => {
  const matches = (query: string, match: string) => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return normalize(match).includes(normalize(query))
  }

  return <>{matchers.some((match) => matches(query, match)) ? children : null}</>
}

const SpendTarget = ({
  currencyCode,
  fiatCurrencyCode,
  onChange,
  _ref,
}: {
  currencyCode: string
  fiatCurrencyCode: string
  onChange: (spendTarget: EdgeSpendTarget) => void
  _ref?: React.RefObject<FlipInputRef>
}) => {
  return (
    <>
      <FormGroup>
        <FormLabel>Public Address:</FormLabel>

        <InputGroup>
          <FormControl onChange={(event) => onChange({ publicAddress: event.currentTarget.value })} />
        </InputGroup>
      </FormGroup>

      <Matcher query={currencyCode} matchers={UNIQUE_IDENTIFIER_CURRENCIES}>
        <FormGroup>
          <FormLabel>Unique Identifier</FormLabel>
          <FormControl onChange={(event) => onChange({ uniqueIdentifier: event.currentTarget.value })} />
        </FormGroup>
      </Matcher>

      <FormGroup>
        <FlipInput
          currencyCode={currencyCode}
          fiatCurrencyCode={fiatCurrencyCode}
          onChange={(nativeAmount: string) => onChange({ nativeAmount })}
          ref={_ref}
        />
      </FormGroup>
    </>
  )
}

type State = EdgeSpendTarget[]
type Action =
  | { type: 'ADD_SPEND_TARGET' }
  | { type: 'REMOVE_SPEND_TARGET'; index: number }
  | { type: 'UPDATE_SPEND_TARGET'; index: number; spendTarget: Partial<EdgeSpendTarget> }

const useSpendTargets = () => {
  const [spendTargets, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case 'ADD_SPEND_TARGET':
          return [...state, { publicAddress: '', nativeAmount: '0', uniqueIdentifier: '', otherParams: {} }]

        case 'REMOVE_SPEND_TARGET':
          return state.filter((_, index) => index !== action.index)

        case 'UPDATE_SPEND_TARGET':
          return state.map((item, index) => (index === action.index ? { ...item, ...action.spendTarget } : item))

        default:
          throw new Error('Invalid Action')
      }
    },
    [{ publicAddress: '', nativeAmount: '0', uniqueIdentifier: '', otherParams: {} }],
  )

  return {
    spendTargets,
    addTarget: React.useCallback(() => dispatch({ type: 'ADD_SPEND_TARGET' }), []),
    removeTarget: React.useCallback((index: number) => dispatch({ type: 'REMOVE_SPEND_TARGET', index }), []),
    updateTarget: React.useCallback(
      (index: number, spendTarget: Partial<EdgeSpendTarget>) =>
        dispatch({ type: 'UPDATE_SPEND_TARGET', spendTarget, index }),
      [],
    ),
  }
}
