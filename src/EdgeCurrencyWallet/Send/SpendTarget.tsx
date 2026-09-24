import { EdgeCurrencyWallet, EdgeSpendTarget, EdgeTokenId } from 'edge-core-js'
import * as React from 'react'

import { FlipInput, FlipInputRef, FormControl, FormGroup, FormLabel, InputGroup, Matcher } from '../../components'

const UNIQUE_IDENTIFIER_PLUGINS = ['binance', 'eos', 'telos', 'stellar', 'ripple']

export type SpendTargetRef = {
  setSpendTarget: (spendTarget: Partial<EdgeSpendTarget>) => void
}

type SpendTargetProps = {
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  fiatCurrencyCode: string
  onChange: (spendTarget: EdgeSpendTarget) => void
}

export const SpendTarget = React.forwardRef<SpendTargetRef, SpendTargetProps>(function SpendInfo( // function syntax required for component display name
  { wallet, tokenId, fiatCurrencyCode, onChange },
  ref,
) {
  const flipInputRef = React.useRef<FlipInputRef>(null)
  const publicAddressRef = React.useRef<HTMLInputElement>(null)
  const uniqueIdentifierRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => ({
    setSpendTarget: (spendTarget: Partial<EdgeSpendTarget>) => {
      if (spendTarget.publicAddress && publicAddressRef.current)
        publicAddressRef.current.value = spendTarget.publicAddress

      if (spendTarget.uniqueIdentifier && uniqueIdentifierRef.current)
        uniqueIdentifierRef.current.value = spendTarget.uniqueIdentifier

      if (spendTarget.nativeAmount && flipInputRef?.current)
        flipInputRef.current.setNativeAmount(spendTarget.nativeAmount)

      onChange(spendTarget)
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

      <Matcher query={wallet.currencyInfo.pluginId} matchers={UNIQUE_IDENTIFIER_PLUGINS}>
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
          wallet={wallet}
          tokenId={tokenId}
          fiatCurrencyCode={fiatCurrencyCode}
          onChange={(nativeAmount: string) => onChange({ nativeAmount })}
          ref={flipInputRef}
        />
      </FormGroup>
    </>
  )
})
