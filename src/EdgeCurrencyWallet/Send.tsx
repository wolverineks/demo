import { EdgeCurrencyWallet, EdgeSpendInfo, EdgeSpendTarget, EdgeTransaction } from 'edge-core-js'
import * as React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import QrReader from 'react-qr-scanner'

import { useEdgeAccount } from '../auth'
import { Debug, DisplayAmount, FlipInput, FlipInputRef, Select } from '../components'
import { useDisplayDenomination, useFiatCurrencyCode, useMaxSpendable, useNewTransaction, useParsedUri } from '../hooks'
import { categories } from '../utils'

const UNIQUE_IDENTIFIER_CURRENCIES = ['BNB', 'EOS', 'TLOS', 'XLM', 'XRP']
const MULTIPLE_TARGETS_CURRENCIES = ['BCH', 'BTC', 'BSV']

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const account = useEdgeAccount()
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  // EdgeMetadata
  const [name, setName] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [category, setCategory] = React.useState('')

  const spendTargetRef = React.useRef<SpendTargetRef>(null)

  // Scan
  const [scan, setScan] = React.useState(false)
  const [uri, setUri] = React.useState<string>()
  const parsedUri = useParsedUri(wallet, uri, {
    enabled: !!uri,
    onSuccess: ({ nativeAmount, uniqueIdentifier, publicAddress }) =>
      spendTargetRef.current?.setSpendTarget({ nativeAmount, publicAddress, uniqueIdentifier }),
  })

  // EdgeTransaction
  const [networkFeeOption, setNetworkFeeOption] = React.useState<EdgeTransaction['networkFeeOption']>('standard')
  const spendTargets = useSpendTargets()
  const spendInfo: EdgeSpendInfo = {
    metadata: { name, notes, category },
    currencyCode,
    spendTargets: spendTargets.all,
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

  return (
    <Form>
      {spendTargets.all.map((spendTarget, index) => (
        <div key={spendTarget.id}>
          {index === 0 ? (
            <SpendTarget
              currencyCode={currencyCode}
              fiatCurrencyCode={fiatCurrencyCode}
              onChange={(spendTarget) => spendTargets.update(index, spendTarget)}
              ref={spendTargetRef}
            />
          ) : (
            <>
              <Button onClick={() => spendTargets.remove(index)}>X - {index}</Button>
              <SpendTarget
                currencyCode={currencyCode}
                fiatCurrencyCode={fiatCurrencyCode}
                onChange={(spendTarget) => spendTargets.update(index, spendTarget)}
              />
            </>
          )}
        </div>
      ))}

      <Matcher query={currencyCode} matchers={MULTIPLE_TARGETS_CURRENCIES}>
        <FormGroup>
          <Button onClick={spendTargets.add}>Add another output</Button>
        </FormGroup>
      </Matcher>

      {spendTargets.all.length === 1 && Number(maxSpendable) > 0 ? (
        <Button onClick={() => spendTargetRef.current?.setSpendTarget({ nativeAmount: maxSpendable })}>
          Spend Max
        </Button>
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

      <Scanner
        onScan={(text) => {
          if (!text) return
          setUri(text)
          setScan(false)
        }}
        show={scan}
      />

      <Debug>
        <JSONPretty
          style={{ maxWidth: 900 }}
          data={{
            error,
            spendTargets,
            displayDenomination: useDisplayDenomination(account, currencyCode)[0],
            fiatCurrencyCode,
            parsedUri: parsedUri,
            currencyCode: String(currencyCode),
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

type SpendTargetRef = {
  setSpendTarget: (spendTarget: Partial<EdgeSpendTarget>) => void
}

type SpendTargetProps = {
  currencyCode: string
  fiatCurrencyCode: string
  onChange: (spendTarget: EdgeSpendTarget) => void
}

const SpendTarget = React.forwardRef<SpendTargetRef, SpendTargetProps>(function SpendInfo( // function ssyntax required for component display name
  { currencyCode, fiatCurrencyCode, onChange },
  ref,
) {
  const flipInputRef = React.useRef<FlipInputRef>(null)
  const publicAddressRef = React.useRef<HTMLInputElement>(null)
  const uniqueIdentifierRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => ({
    setSpendTarget: (spendTarget: Partial<EdgeSpendTarget>) => {
      if (spendTarget.publicAddress && publicAddressRef?.current)
        publicAddressRef.current.value = spendTarget.publicAddress

      if (spendTarget.uniqueIdentifier && uniqueIdentifierRef.current)
        uniqueIdentifierRef.current.value = spendTarget.uniqueIdentifier

      if (spendTarget.nativeAmount && flipInputRef?.current)
        flipInputRef.current.setNativeAmount(spendTarget.nativeAmount)
    },
  }))

  return (
    <>
      <FormGroup>
        <FormLabel>Public Address:</FormLabel>

        <InputGroup>
          <FormControl
            ref={publicAddressRef}
            onChange={(event) => onChange({ publicAddress: event.currentTarget.value })}
          />
        </InputGroup>
      </FormGroup>

      <Matcher query={currencyCode} matchers={UNIQUE_IDENTIFIER_CURRENCIES}>
        <FormGroup>
          <FormLabel>Unique Identifier</FormLabel>
          <FormControl
            ref={uniqueIdentifierRef}
            onChange={(event) => onChange({ uniqueIdentifier: event.currentTarget.value })}
          />
        </FormGroup>
      </Matcher>

      <FormGroup>
        <FlipInput
          currencyCode={currencyCode}
          fiatCurrencyCode={fiatCurrencyCode}
          onChange={(nativeAmount: string) => onChange({ nativeAmount })}
          ref={flipInputRef}
        />
      </FormGroup>
    </>
  )
})

type State = (EdgeSpendTarget & { id: number })[]
type Action =
  | { type: 'ADD_SPEND_TARGET' }
  | { type: 'REMOVE_SPEND_TARGET'; index: number }
  | { type: 'UPDATE_SPEND_TARGET'; index: number; spendTarget: Partial<EdgeSpendTarget> }

let spendTargetsCounter = 0 // add id to spendTarget to use as component key

const useSpendTargets = () => {
  const [spendTargets, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case 'ADD_SPEND_TARGET':
          return [
            ...state,
            {
              id: (spendTargetsCounter += 1),
              publicAddress: '',
              nativeAmount: '0',
              uniqueIdentifier: '',
              otherParams: {},
            },
          ]

        case 'REMOVE_SPEND_TARGET':
          return state.filter((_, index) => index !== action.index)

        case 'UPDATE_SPEND_TARGET':
          return state.map((item, index) => (index === action.index ? { ...item, ...action.spendTarget } : item))

        default:
          throw new Error('Invalid Action')
      }
    },
    [{ id: 0, publicAddress: '', nativeAmount: '0', uniqueIdentifier: '', otherParams: {} }],
  )

  const add = () => dispatch({ type: 'ADD_SPEND_TARGET' })
  const remove = (index: number) => dispatch({ type: 'REMOVE_SPEND_TARGET', index })
  const update = (index: number, spendTarget: Partial<EdgeSpendTarget>) =>
    dispatch({ type: 'UPDATE_SPEND_TARGET', spendTarget, index })

  return {
    all: spendTargets,
    add: React.useCallback(add, []),
    remove: React.useCallback(remove, []),
    update: React.useCallback(update, []),
  }
}
