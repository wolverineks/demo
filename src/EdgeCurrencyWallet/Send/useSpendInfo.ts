import { EdgeCurrencyWallet, EdgeMetadata, EdgeSpendInfo, EdgeSpendTarget } from 'edge-core-js'
import * as React from 'react'

import { useParsedUri } from '../../hooks'
import { SpendTargetRef } from './SpendTarget'
import { useSpendTargets } from './useSpendTargets'

export const useSpendInfo = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const spendTargetRef = React.useRef<SpendTargetRef>(null)
  const [uri, setUri] = React.useState<string>()
  useParsedUri(wallet, uri, {
    enabled: !!uri,
    onSuccess: ({ nativeAmount, publicAddress, uniqueIdentifier }) => {
      spendTargetRef.current?.setSpendTarget({ nativeAmount, publicAddress, uniqueIdentifier })
    },
  })

  const spendTargets = useSpendTargets()
  const [metadata, setMetadata] = React.useState({})
  const [networkFeeOption, setNetworkFeeOption] = React.useState<EdgeSpendInfo['networkFeeOption']>('standard')
  const updateMetadata = (metadata: EdgeMetadata) => setMetadata((current) => ({ ...current, ...metadata }))

  const spendInfo = React.useMemo(
    () => ({
      currencyCode,
      spendTargets: spendTargets.all.map(({ id: _id, ...spendTarget }) => spendTarget as EdgeSpendTarget),
      metadata,
      networkFeeOption,
    }),
    [currencyCode, metadata, networkFeeOption, spendTargets],
  )

  return {
    setNetworkFeeOption,
    setUri,
    spendInfo,
    spendTargetRef,
    spendTargets,
    updateMetadata,
  }
}
