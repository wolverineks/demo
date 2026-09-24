import { EdgeCurrencyWallet, EdgeTokenId, EdgeTransaction } from 'edge-core-js'
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
import {
  useTokenDenominations,
  useFiatCurrencyCode,
  useNewTransaction,
  usePasteUri,
  useSignBroadcastAndSaveTx,
  useSpendMax,
} from '../../hooks'
import { useSelectedWallet } from '../../SelectedWallet'
import { categories, getCurrencyCodeFromTokenId } from '../../utils'
import { SpendTarget } from './SpendTarget'
import { CustomFee, canAdjustFees, useSpendInfo } from './useSpendInfo'

const MULTIPLE_OUTPUT_PLUGINS = ['bitcoin', 'bitcoincash', 'bitcoinsv']
const QrReader = React.lazy(() => import('react-qr-scanner'))

export const Send: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [scan, setScan] = React.useState(false)
  const spendMax = useSpendMax(wallet)
  const pasteUri = usePasteUri(wallet)

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
  } = useSpendInfo(wallet, tokenId)

  const { data: transaction, error } = useNewTransaction(wallet, spendInfo, {
    enabled: !!spendInfo.spendTargets[0].publicAddress && !!Number(spendInfo.spendTargets[0].nativeAmount),
  })
  const { mutate: sendTransaction, isLoading, error: sendError } = useSignBroadcastAndSaveTx(wallet)

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
              wallet={wallet}
              tokenId={tokenId}
              fiatCurrencyCode={fiatCurrencyCode}
              onChange={(newSpendTarget) => spendTargets.update(id, newSpendTarget)}
              ref={spendTargetRef}
            />
          ) : (
            <>
              <Button onClick={() => spendTargets.remove(index)}>X - {index}</Button>
              <SpendTarget
                wallet={wallet}
                tokenId={tokenId}
                fiatCurrencyCode={fiatCurrencyCode}
                onChange={(spendTarget) => spendTargets.update(index, spendTarget)}
              />
            </>
          )}
        </div>
      ))}

      <Matcher query={wallet.currencyInfo.pluginId} matchers={MULTIPLE_OUTPUT_PLUGINS}>
        <FormGroup>
          <Button onClick={spendTargets.add}>Add another output</Button>
        </FormGroup>
      </Matcher>

      {spendInfo.spendTargets.length === 1 ? (
        <Button
          disabled={spendMax.isLoading}
          onClick={() =>
            spendMax.mutate(spendInfo, {
              onSuccess: (nativeAmount) => spendTargetRef.current?.setSpendTarget({ nativeAmount }),
            })
          }
        >
          {spendMax.isLoading ? 'Loading max…' : 'Spend Max'}
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

      <Button onClick={() => pasteUri.mutate(undefined, { onSuccess: setUri })}>Paste From Clipboard</Button>

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
      {spendMax.error ? <Alert variant="danger">{(spendMax.error as Error).message}</Alert> : null}
      {pasteUri.error ? <Alert variant="danger">{(pasteUri.error as Error).message}</Alert> : null}

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
  const [{ wallet, tokenId }] = useSelectedWallet()
  const { display } = useTokenDenominations(account, wallet, tokenId)

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
              pluginId={wallet.currencyInfo.pluginId}
              tokenId={fee.tokenId}
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
