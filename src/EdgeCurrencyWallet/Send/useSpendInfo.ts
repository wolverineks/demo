import { EdgeCurrencyWallet, EdgeMetadata, EdgeSpendInfo, EdgeSpendTarget } from 'edge-core-js'
import * as React from 'react'

import { useParsedUri } from '../../hooks'
import { SpendTargetRef } from './SpendTarget'
import { useSpendTargets } from './useSpendTargets'

export const canAdjustFees = (wallet: EdgeCurrencyWallet) => wallet.currencyInfo.defaultSettings.customFeeSettings

export type CustomFee = { [key: string]: string }

export const useSpendInfo = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const spendTargetRef = React.useRef<SpendTargetRef>(null)
  const standardFeeOptions = [
    { value: 'high', display: 'high' },
    { value: 'standard', display: 'standard' },
    { value: 'low', display: 'low' },
  ] as const
  const feeOptions = canAdjustFees(wallet)
    ? ([...standardFeeOptions, { value: 'custom', display: 'custom' }] as const)
    : standardFeeOptions
  const spendTargets = useSpendTargets()
  const [metadata, setMetadata] = React.useState<EdgeSpendInfo['metadata']>({})
  const [networkFeeOption, setNetworkFeeOption] =
    React.useState<NonNullable<EdgeSpendInfo['networkFeeOption']>>('standard')
  const [customNetworkFee, _setCustomNetworkFee] = React.useState<NonNullable<EdgeSpendInfo['customNetworkFee']>>(
    canAdjustFees(wallet)
      ? (wallet.currencyInfo.defaultSettings.customFeeSettings as string[]).reduce(
          (result, current) => ({ ...result, [current]: '0' }),
          {} as CustomFee,
        )
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

  const spendInfo = {
    currencyCode,
    spendTargets: spendTargets.all.map(({ id: _id, ...spendTarget }) => spendTarget as EdgeSpendTarget),
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
