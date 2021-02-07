import { EdgeSpendTarget } from 'edge-core-js'
import * as React from 'react'
import { FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'

import { FlipInput, FlipInputRef } from '../../components'

const UNIQUE_IDENTIFIER_CURRENCIES = ['BNB', 'EOS', 'TLOS', 'XLM', 'XRP']

export type SpendTargetRef = {
  setSpendTarget: (spendTarget: Partial<EdgeSpendTarget>) => void
}

type SpendTargetProps = {
  currencyCode: string
  fiatCurrencyCode: string
  onChange: (spendTarget: EdgeSpendTarget) => void
}

export const SpendTarget = React.forwardRef<SpendTargetRef, SpendTargetProps>(function SpendInfo( // function syntax required for component display name
  { currencyCode, fiatCurrencyCode, onChange },
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

const Matcher: React.FC<{ query: string; matchers: string[] }> = ({ children, query, matchers }) => {
  const matches = (query: string, match: string) => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return normalize(match).includes(normalize(query))
  }

  return <>{matchers.some((match) => matches(query, match)) ? children : null}</>
}
