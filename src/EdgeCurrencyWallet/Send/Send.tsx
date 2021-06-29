import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import * as React from 'react'
import JSONPretty from 'react-json-pretty'
import QrReader from 'react-qr-scanner'

import { useEdgeAccount } from '../../auth'
import {
  Alert,
  AmountInput,
  Button,
  Debug,
  DisplayAmount,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Matcher,
  Select,
} from '../../components'
import { useClipboardUri, useDenominations, useFiatCurrencyCode, useMaxSpendable, useNewTransaction } from '../../hooks'
import { useSelectedWallet } from '../../SelectedWallet'
import { categories } from '../../utils'
import { SpendTarget } from './SpendTarget'
import { CustomFee, canAdjustFees, useSpendInfo } from './useSpendInfo'

const MULTIPLE_TARGETS_CURRENCIES = ['BCH', 'BTC', 'BSV']

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [scan, setScan] = React.useState(false)
  const clipboardUri = useClipboardUri(wallet)

  const {
    customNetworkFee,
    setCustomNetworkFee,
    updateMetadata,
    networkFeeOption,
    setNetworkFeeOption,
    feeOptions,
    setUri,
    spendTargetRef,
    spendTargets,
    spendInfo,
  } = useSpendInfo(wallet, currencyCode)

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

      {spendInfo.spendTargets.length === 1 && Number(maxSpendable) > 0 ? (
        <Button onClick={() => spendTargetRef.current?.setSpendTarget({ nativeAmount: maxSpendable })}>
          Spend Max
        </Button>
      ) : null}

      {clipboardUri ? <Button onClick={() => setUri(clipboardUri)}>Paste From Clipboard</Button> : null}

      <FormGroup>
        <FormLabel>Name</FormLabel>
        <FormControl
          value={spendInfo.metadata?.name}
          onChange={(event) => updateMetadata({ name: event.currentTarget.value })}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Notes</FormLabel>
        <FormControl
          as={'textarea'}
          value={spendInfo.metadata?.notes}
          onChange={(event) => updateMetadata({ notes: event.currentTarget.value })}
        />
      </FormGroup>

      <Select
        value={spendInfo.metadata?.category}
        title={'Category'}
        onSelect={(event) => updateMetadata({ category: event.currentTarget.value })}
        options={[{ value: 'none', display: '-' }, ...categories]}
        renderOption={(category) => (
          <option value={category.value} key={category.value}>
            {category.display}
          </option>
        )}
      />

      {canAdjustFees(wallet) ? (
        <Select
          title={'Fee Option'}
          onSelect={(event) => setNetworkFeeOption(event.currentTarget.value)}
          options={feeOptions}
          defaultValue={'standard'}
          renderOption={(category) => (
            <option value={category.value} key={category.value}>
              {category.display}
            </option>
          )}
        />
      ) : null}

      {networkFeeOption === 'custom' ? (
        <CustomFeeForm customFee={customNetworkFee} setCustomFee={setCustomNetworkFee} />
      ) : null}

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
            error: (error as Error)?.message,
            fiatCurrencyCode,
            currencyCode,
            spendInfo,
            maxSpendable,
            transaction,
            clipboardUri,
          }}
        />
      </Debug>
    </Form>
  )
}

const CustomFeeForm = ({
  customFee,
  setCustomFee,
}: {
  customFee: CustomFee
  setCustomFee: (customFee: CustomFee) => any
}) => {
  const account = useEdgeAccount()
  const [{ wallet, currencyCode }] = useSelectedWallet()
  const { display } = useDenominations(account, currencyCode)

  return (
    <div>
      <div>{JSON.stringify(customFee, null, 2)}</div>
      {wallet.currencyInfo.defaultSettings.customFeeSettings.map((setting: string) => {
        return (
          <div key={setting}>
            {setting}
            <div>
              <AmountInput
                onChange={(amount) => setCustomFee({ [setting]: amount })}
                amount={customFee[setting]}
                denomination={display}
              />
            </div>
          </div>
        )
      })}
    </div>
  )

  // return null
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

      <QrReader delay={300} onError={setError} onScan={(data: string) => onScan(data || '')} style={{ width: '50%' }} />
    </div>
  ) : null
}
