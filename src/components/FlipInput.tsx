import { EdgeDenomination, EdgeRateCache } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { AmountInput, Boundary } from '../components'
import { useDenominations } from '../hooks'
import { denominatedToNative, nativeToDenominated } from '../utils'

type FlipInputProps = {
  onChange: (nativeAmount: string) => any
  currencyCode: string
  fiatCurrencyCode: string
  nativeAmount?: string
}

export type FlipInputRef = {
  setNativeAmount: (nativeAmount: string) => void
}

export const FlipInput = React.forwardRef<FlipInputRef, FlipInputProps>(
  ({ currencyCode, fiatCurrencyCode, onChange }, ref) => {
    const account = useEdgeAccount()
    const topDenominations = useDenominations(account, currencyCode)
    const bottomDenominations = useDenominations(account, fiatCurrencyCode)

    const { top, bottom } = useFlipInput({
      rateCache: account.rateCache,
      onChange,
      currencyCode,
      fiatCurrencyCode,
      topDenominations,
      bottomDenominations,
    })

    React.useImperativeHandle(ref, () => ({
      setNativeAmount: (nativeAmount: string) => {
        const displayAmount = nativeToDenominated({
          nativeAmount,
          denomination: topDenominations.display,
        })

        top.onChange(displayAmount)
      },
    }))

    return (
      <div>
        <Boundary>
          <AmountInput {...top} />
        </Boundary>
        <Boundary>
          <AmountInput {...bottom} />
        </Boundary>
      </div>
    )
  },
)

const useFlipInput = ({
  rateCache,
  onChange,
  currencyCode,
  fiatCurrencyCode,
  topDenominations,
  bottomDenominations,
}: {
  rateCache: EdgeRateCache
  onChange: (nativeAmount: string) => any
  currencyCode: string
  fiatCurrencyCode: string
  topDenominations: { display: EdgeDenomination; exchange: EdgeDenomination }
  bottomDenominations: { display: EdgeDenomination; exchange: EdgeDenomination }
}) => {
  const [topDisplayAmount, setTopDisplayAmount] = React.useState('0')
  const [bottomDisplayAmount, setBottomDisplayAmount] = React.useState('0')

  const onTopChange = async (topDisplayAmount: string) => {
    const topNativeAmount = denominatedToNative({
      amount: topDisplayAmount,
      denomination: topDenominations.display,
    })
    const topExchangeAmount = nativeToDenominated({
      nativeAmount: topNativeAmount,
      denomination: topDenominations.exchange,
    })
    const bottomExchangeAmount = await rateCache.convertCurrency(
      currencyCode,
      fiatCurrencyCode,
      Number(topExchangeAmount),
    )
    const bottomNativeAmount = denominatedToNative({
      amount: String(bottomExchangeAmount),
      denomination: bottomDenominations.exchange,
    })
    const bottomDisplayAmount = nativeToDenominated({
      nativeAmount: String(bottomNativeAmount),
      denomination: bottomDenominations.display,
    })

    setTopDisplayAmount(topDisplayAmount)
    setBottomDisplayAmount(String(bottomDisplayAmount))
    onChange(topNativeAmount)
  }

  const onBottomChange = async (bottomDisplayAmount: string) => {
    const bottomNativeAmount = denominatedToNative({
      amount: bottomDisplayAmount,
      denomination: bottomDenominations.display,
    })
    const bottomExchangeAmount = nativeToDenominated({
      nativeAmount: bottomNativeAmount,
      denomination: bottomDenominations.exchange,
    })
    const topExchangeAmount = await rateCache.convertCurrency(
      fiatCurrencyCode,
      currencyCode,
      Number(bottomExchangeAmount),
    )
    const topNativeAmount = denominatedToNative({
      amount: String(topExchangeAmount),
      denomination: topDenominations.exchange,
    })
    const topDisplayAmount = nativeToDenominated({
      nativeAmount: topNativeAmount,
      denomination: topDenominations.display,
    })

    setBottomDisplayAmount(bottomDisplayAmount)
    setTopDisplayAmount(String(topDisplayAmount))
    onChange(topNativeAmount)
  }

  return {
    top: {
      amount: topDisplayAmount,
      denomination: topDenominations.display,
      onChange: onTopChange,
    },
    bottom: {
      amount: bottomDisplayAmount,
      denomination: bottomDenominations.display,
      onChange: onBottomChange,
    },
  }
}
