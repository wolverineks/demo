import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import * as React from 'react'
import JSONPretty from 'react-json-pretty'

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
import { useDenominations, useFiatCurrencyCode, useNewTransaction, useSignBroadcastAndSaveTx } from '../../hooks'
import { useSelectedWallet } from '../../SelectedWallet'
import { categories, getCurrencyCodeFromTokenId } from '../../utils'
import { SpendTarget } from './SpendTarget'
import { CustomFee, canAdjustFees, useSpendInfo } from './useSpendInfo'

const MULTIPLE_TARGETS_CURRENCIES = ['BCH', 'BTC', 'BSV']
const QrReader = React.lazy(() => import('react-qr-scanner'))

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [scan, setScan] = React.useState(false)
  const [maxLoading, setMaxLoading] = React.useState(false)
  const [maxError, setMaxError] = React.useState<string>()
  const [pasteError, setPasteError] = React.useState<string>()

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

  const { data: transaction, error } = useNewTransaction(wallet, spendInfo, {
    enabled: !!spendInfo.spendTargets[0].publicAddress && !!Number(spendInfo.spendTargets[0].nativeAmount),
  })
  const { mutate: sendTransaction, isLoading, error: sendError } = useSignBroadcastAndSaveTx(wallet)

  const onSpendMax = async () => {
    setMaxLoading(true)
    setMaxError(undefined)
    try {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      spendTargetRef.current?.setSpendTarget({ nativeAmount: maxSpendable })
    } catch (spendMaxError) {
      setMaxError(spendMaxError instanceof Error ? spendMaxError.message : String(spendMaxError))
    } finally {
      setMaxLoading(false)
    }
  }

  const onPasteFromClipboard = async () => {
    setPasteError(undefined)
    try {
      const clipboard = await navigator.clipboard.readText()
      await wallet.parseUri(clipboard)
      setUri(clipboard)
    } catch (clipboardError) {
      setPasteError(clipboardError instanceof Error ? clipboardError.message : String(clipboardError))
    }
  }

  const onConfirm = () => {
    if (!transaction) return
    sendTransaction(transaction)
  }

  return (
    <Form>
      {spendTargets.all.map(({ id }, index) => (
        <div key={id}>
          {index === 0 ? (
            <SpendTarget
              currencyCode={currencyCode}
              fiatCurrencyCode={fiatCurrencyCode}
              onChange={(newSpendTarget) => spendTargets.update(id, newSpendTarget)}
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

      {spendInfo.spendTargets.length === 1 ? (
        <Button disabled={maxLoading} onClick={() => onSpendMax()}>
          {maxLoading ? 'Loading max…' : 'Spend Max'}
        </Button>
      ) : null}

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

      {transaction?.networkFees?.length ? <Fee wallet={wallet} transaction={transaction} /> : null}

      <Button onClick={() => onPasteFromClipboard()}>Paste From Clipboard</Button>

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

      {error && <Alert>{(error as Error).message}</Alert>}
      {sendError && <Alert variant="danger">{sendError.message}</Alert>}
      {maxError ? <Alert variant="danger">{maxError}</Alert> : null}
      {pasteError ? <Alert variant="danger">{pasteError}</Alert> : null}

      <Button disabled={!transaction || isLoading} onClick={() => onConfirm()}>
        {isLoading ? 'Sending…' : 'Confirm'}
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
            transaction,
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
      {(wallet.currencyInfo.defaultSettings?.customFeeSettings as string[] | undefined)?.map((setting: string) => {
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

const Fee = ({ wallet, transaction }: { wallet: EdgeCurrencyWallet; transaction: EdgeTransaction }) => {
  if (transaction.networkFees.length === 0) return null

  return (
    <FormGroup>
      <FormLabel>Fees</FormLabel>
      <ul>
        {transaction.networkFees.map((fee, index) => (
          <li key={`${fee.tokenId ?? 'native'}-${index}`}>
            <DisplayAmount
              nativeAmount={fee.nativeAmount}
              currencyCode={getCurrencyCodeFromTokenId(wallet, fee.tokenId)}
            />
          </li>
        ))}
      </ul>
    </FormGroup>
  )
}

const Scanner: React.FC<{ onScan: (data: string) => any; show: boolean }> = ({ onScan, show }) => {
  const [error, setError] = React.useState<Error>()

  return show ? (
    <div>
      {error && <Alert variant={'danger'}>{error.message}</Alert>}

      <React.Suspense fallback={<div className="empty-state">Starting camera…</div>}>
        <QrReader delay={300} onError={setError} onScan={(data: string) => onScan(data || '')} style={{ width: '50%' }} />
      </React.Suspense>
    </div>
  ) : null
}
