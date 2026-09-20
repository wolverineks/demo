import { EdgeCurrencyWallet, EdgeMemo, EdgeMetadata, EdgeSpendInfo } from 'edge-core-js'
import * as React from 'react'

import { useParsedUri } from '../../hooks'
import { getTokenIdFromCurrencyCode } from '../../utils'
import { SpendTargetRef } from './SpendTarget'
import { useSpendTargets } from './useSpendTargets'

export const canAdjustFees = (wallet: EdgeCurrencyWallet) =>
  Array.isArray(wallet.currencyInfo.defaultSettings?.customFeeSettings)

export type CustomFee = { [key: string]: string }

export const useSpendInfo = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const spendTargetRef = React.useRef<SpendTargetRef>(null)
  const spendTargets = useSpendTargets()
  const [metadata, setMetadata] = React.useState<EdgeSpendInfo['metadata']>({})

  const feeOptions = canAdjustFees(wallet)
    ? ([...standardFeeOptions, { value: 'custom', display: 'custom' }] as const)
    : standardFeeOptions
  const [networkFeeOption, setNetworkFeeOption] =
    React.useState<NonNullable<EdgeSpendInfo['networkFeeOption']>>('standard')
  const customFeeSettings = (wallet.currencyInfo.defaultSettings?.customFeeSettings as string[] | undefined) ?? []
  const [customNetworkFee, _setCustomNetworkFee] = React.useState<NonNullable<EdgeSpendInfo['customNetworkFee']>>(
    canAdjustFees(wallet)
      ? customFeeSettings.reduce((result, current) => ({ ...result, [current]: '0' }), {} as CustomFee)
      : {},
  )
  const setCustomNetworkFee = (networkFee: Partial<CustomFee>) =>
    _setCustomNetworkFee((current) => ({ ...current, ...networkFee }))
  const updateMetadata = (metadata: EdgeMetadata) => setMetadata((current) => ({ ...current, ...metadata }))

  const [uri, setUri] = React.useState<string>()
  useParsedUri(wallet, uri, {
    enabled: !!uri,
    onSuccess: ({ nativeAmount, publicAddress, uniqueIdentifier, metadata }) => {
      spendTargetRef.current?.setSpendTarget({ nativeAmount, publicAddress, uniqueIdentifier })
      metadata && updateMetadata(metadata)
    },
  })

  const spendInfo: EdgeSpendInfo = {
    tokenId: getTokenIdFromCurrencyCode(wallet, currencyCode),
    spendTargets: spendTargets.all.map(
      ({ id: _id, uniqueIdentifier: _uniqueIdentifier, memo: _memo, ...spendTarget }) => spendTarget,
    ),
    memos: toMemos(spendTargets.all),
    metadata,
    networkFeeOption,
    customNetworkFee,
  }

  return {
    customNetworkFee,
    setCustomNetworkFee,
    networkFeeOption,
    setNetworkFeeOption,
    feeOptions,
    setUri,
    spendInfo,
    spendTargetRef,
    spendTargets,
    updateMetadata,
  }
}

const standardFeeOptions = [
  { value: 'high', display: 'high' },
  { value: 'standard', display: 'standard' },
  { value: 'low', display: 'low' },
] as const

const toMemos = (spendTargets: Array<{ uniqueIdentifier?: string; memo?: string }>): EdgeMemo[] | undefined => {
  const memos = spendTargets
    .map(({ uniqueIdentifier, memo }) => uniqueIdentifier || memo)
    .filter((value): value is string => !!value)
    .map((value) => ({ type: 'text' as const, value }))

  return memos.length > 0 ? memos : undefined
}
