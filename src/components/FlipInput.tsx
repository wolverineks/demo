import { EdgeCurrencyWallet, EdgeDenomination, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { AmountInput, Boundary } from '../components'
import { convertCurrency, denominatedToNative, getFiatInfo, nativeToDenominated, useCryptoDenominations, useDenominations } from '../hooks'
import { getCurrencyCodeFromTokenId } from '../utils'

type FlipInputProps = {
  onChange: (nativeAmount: string) => any
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  fiatCurrencyCode: string
  nativeAmount?: string
}

export type FlipInputRef = {
  setNativeAmount: (nativeAmount: string) => void
}

export const FlipInput = React.forwardRef<FlipInputRef, FlipInputProps>(function FlipInput(
  { wallet, tokenId, fiatCurrencyCode, onChange },
  ref,
) {
  const account = useEdgeAccount()
  const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const topDenominations = useCryptoDenominations(account, wallet.currencyInfo.pluginId, tokenId)
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const bottomDenominations = useDenominations(account, fiatInfo)

  const { top, bottom } = useFlipInput({
    onChange,
    currencyCode,
    fiatCurrencyCode,
    topDenominations,
    bottomDenominations,
  })

  React.useImperativeHandle(ref, () => ({
    setNativeAmount: (nativeAmount) => {
      const displayAmount = nativeToDenominated({
        nativeAmount,
        denomination: topDenominations.display,
      })

      top.onChange(displayAmount)
    },
  }))

  return (
    <div className="flip-input">
      <Boundary>
        <AmountInput className="flip-input__primary" {...top} />
      </Boundary>
      <Boundary>
        <AmountInput className="flip-input__secondary" {...bottom} />
      </Boundary>
    </div>
  )
})

const useFlipInput = ({
  onChange,
  currencyCode,
  fiatCurrencyCode,
  topDenominations,
  bottomDenominations,
}: {
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
    const bottomExchangeAmount = await convertCurrency(currencyCode, fiatCurrencyCode, Number(topExchangeAmount))
    const bottomNativeAmount = denominatedToNative({
      amount: String(bottomExchangeAmount),
      denomination: bottomDenominations.exchange,
    })
    const bottomDisplayAmount = nativeToDenominated({
      nativeAmount: String(bottomNativeAmount),
      denomination: bottomDenominations.display,
    })

    setTopDisplayAmount(topDisplayAmount)
    setBottomDisplayAmount(formatFiatAmount(bottomDisplayAmount))
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
    const topExchangeAmount = await convertCurrency(fiatCurrencyCode, currencyCode, Number(bottomExchangeAmount))
    const topNativeAmount = denominatedToNative({
      amount: String(topExchangeAmount),
      denomination: topDenominations.exchange,
    })
    const topDisplayAmount = nativeToDenominated({
      nativeAmount: topNativeAmount,
      denomination: topDenominations.display,
    })

    setBottomDisplayAmount(bottomDisplayAmount)
    setTopDisplayAmount(formatCryptoAmount(topDisplayAmount))
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

const formatFiatAmount = (amount: string) => {
  const value = Number(amount)

  return Number.isFinite(value) ? value.toFixed(2) : '0.00'
}

const formatCryptoAmount = (amount: string) => {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0'

  return String(Number(value.toFixed(8)))
}
