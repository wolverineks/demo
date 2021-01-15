import React from 'react'

import { useEdgeAccount } from '../auth'
import { AmountInput, Boundary } from '../components'
import { useDisplayDenomination } from '../hooks'
import { denominatedToNative, getExchangeDenomination, nativeToDenominated } from '../utils'

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
    const { top, bottom } = useFlipInput({ onChange, currencyCode, fiatCurrencyCode, ref })

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

// useRef version (uglier but easier to reason)
const useFlipInput = ({
  onChange,
  currencyCode,
  fiatCurrencyCode,
  ref,
}: {
  onChange: (nativeAmount: string) => any
  currencyCode: string
  fiatCurrencyCode: string
  ref: any
}) => {
  const account = useEdgeAccount()

  const [direction, setDirection] = React.useState<'cryptoToFiat' | 'fiatToCrypto'>('cryptoToFiat')

  const [topDisplayAmount, setTopDisplayAmount] = React.useState('0')
  const [bottomDisplayAmount, setBottomDisplayAmount] = React.useState('0')

  const topDisplayDenomination = useDisplayDenomination(account, currencyCode)[0]
  const bottomDisplayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

  const topExchangeDenomination = getExchangeDenomination(account, currencyCode)
  const bottomExchangeDenomination = getExchangeDenomination(account, fiatCurrencyCode)

  React.useImperativeHandle(ref, () => ({
    setNativeAmount: async (nativeAmount: string) => {
      const topDisplayAmount = nativeToDenominated({
        nativeAmount,
        denomination: topDisplayDenomination,
      })

      const topExchangeAmount = nativeToDenominated({
        nativeAmount,
        denomination: topExchangeDenomination,
      })
      const bottomExchangeAmount = await account.rateCache.convertCurrency(
        currencyCode,
        fiatCurrencyCode,
        Number(topExchangeAmount),
      )
      const bottomNativeAmount = denominatedToNative({
        amount: String(bottomExchangeAmount),
        denomination: bottomExchangeDenomination,
      })
      const bottomDisplayAmount = nativeToDenominated({
        nativeAmount: bottomNativeAmount,
        denomination: bottomDisplayDenomination,
      })

      setTopDisplayAmount(topDisplayAmount)
      setBottomDisplayAmount(String(bottomDisplayAmount))

      onChange(nativeAmount)
    },
  }))

  React.useEffect(() => {
    const onTopChange = async (topDisplayAmount: string) => {
      const topNativeAmount = denominatedToNative({
        amount: topDisplayAmount,
        denomination: topDisplayDenomination,
      })
      const topExchangeAmount = nativeToDenominated({
        nativeAmount: topNativeAmount,
        denomination: topExchangeDenomination,
      })
      const bottomExchangeAmount = await account.rateCache.convertCurrency(
        currencyCode,
        fiatCurrencyCode,
        Number(topExchangeAmount),
      )
      const bottomNativeAmount = denominatedToNative({
        amount: String(bottomExchangeAmount),
        denomination: bottomExchangeDenomination,
      })
      const bottomDisplayAmount = nativeToDenominated({
        nativeAmount: bottomNativeAmount,
        denomination: bottomDisplayDenomination,
      })

      setTopDisplayAmount(topDisplayAmount)
      setBottomDisplayAmount(String(bottomDisplayAmount))

      onChange(topNativeAmount)
    }

    const onBottomChange = async (bottomDisplayAmount: string) => {
      const bottomNativeAmount = denominatedToNative({
        amount: bottomDisplayAmount,
        denomination: bottomDisplayDenomination,
      })
      const bottomExchangeAmount = nativeToDenominated({
        nativeAmount: bottomNativeAmount,
        denomination: bottomExchangeDenomination,
      })
      const topExchangeAmount = await account.rateCache.convertCurrency(
        fiatCurrencyCode,
        currencyCode,
        Number(bottomExchangeAmount),
      )
      const topNativeAmount = denominatedToNative({
        amount: String(topExchangeAmount),
        denomination: topExchangeDenomination,
      })
      const topDisplayAmount = nativeToDenominated({
        nativeAmount: topNativeAmount,
        denomination: topDisplayDenomination,
      })

      setBottomDisplayAmount(bottomDisplayAmount)
      setTopDisplayAmount(String(topDisplayAmount))
      onChange(topNativeAmount)
    }

    direction === 'cryptoToFiat' ? onTopChange(topDisplayAmount) : onBottomChange(bottomDisplayAmount)
  }, [
    account.rateCache,
    bottomDisplayAmount,
    bottomDisplayDenomination,
    bottomExchangeDenomination,
    currencyCode,
    direction,
    fiatCurrencyCode,
    onChange,
    topDisplayAmount,
    topDisplayDenomination,
    topExchangeDenomination,
  ])

  return {
    top: {
      amount: topDisplayAmount,
      denomination: topDisplayDenomination,
      setDisplayAmount: setTopDisplayAmount,
      onChange: (displayAmount: string) => {
        setDirection('cryptoToFiat')
        setTopDisplayAmount(displayAmount)
      },
    },
    bottom: {
      amount: bottomDisplayAmount,
      denomination: bottomDisplayDenomination,
      onChange: (displayAmount: string) => {
        setDirection('fiatToCrypto')
        setBottomDisplayAmount(displayAmount)
      },
    },
  }
}

// useLayoutEffect version (harder to reason, but looks better)
// export const FlipInput: React.FC<{
//   onChange: (nativeAmount: string) => any
//   currencyCode: string
//   fiatCurrencyCode: string
//   nativeAmount?: string
// }> = ({ currencyCode, fiatCurrencyCode, onChange, nativeAmount }) => {
//   const { top, bottom } = useFlipInput({ onChange, currencyCode, fiatCurrencyCode, nativeAmount })

//   return (
//     <div>
//       <Boundary>
//         <AmountInput {...top} />
//       </Boundary>
//       <Boundary>
//         <AmountInput {...bottom} />
//       </Boundary>
//     </div>
//   )
// }
//
// const useFlipInput = ({
//   onChange,
//   currencyCode,
//   fiatCurrencyCode,
//   nativeAmount,
// }: {
//   onChange: (nativeAmount: string) => any
//   currencyCode: string
//   fiatCurrencyCode: string
//   nativeAmount?: string
// }) => {
//   const account = useEdgeAccount()

//   const [direction, setDirection] = React.useState<'cryptoToFiat' | 'fiatToCrypto'>('cryptoToFiat')

//   const [topDisplayAmount, setTopDisplayAmount] = React.useState('0')
//   const [bottomDisplayAmount, setBottomDisplayAmount] = React.useState('0')

//   const topDisplayDenomination = useDisplayDenomination(account, currencyCode)[0]
//   const bottomDisplayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

//   const topExchangeDenomination = getExchangeDenomination(account, currencyCode)
//   const bottomExchangeDenomination = getExchangeDenomination(account, fiatCurrencyCode)

//   React.useLayoutEffect(() => {
//     const incomingNativeAmount = async () => {
//       if (!nativeAmount) return
//       const topDisplayAmount = nativeToDenominated({
//         nativeAmount,
//         denomination: topDisplayDenomination,
//       })

//       const topExchangeAmount = nativeToDenominated({
//         nativeAmount,
//         denomination: topExchangeDenomination,
//       })
//       const bottomExchangeAmount = await account.rateCache.convertCurrency(
//         currencyCode,
//         fiatCurrencyCode,
//         Number(topExchangeAmount),
//       )
//       const bottomNativeAmount = denominatedToNative({
//         amount: String(bottomExchangeAmount),
//         denomination: bottomExchangeDenomination,
//       })
//       const bottomDisplayAmount = nativeToDenominated({
//         nativeAmount: bottomNativeAmount,
//         denomination: bottomDisplayDenomination,
//       })

//       setTopDisplayAmount(topDisplayAmount)
//       setBottomDisplayAmount(String(bottomDisplayAmount))

//       onChange(nativeAmount)
//     }

//     incomingNativeAmount()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [nativeAmount])

//   React.useEffect(() => {
//     const onTopChange = async (topDisplayAmount: string) => {
//       const topNativeAmount = denominatedToNative({
//         amount: topDisplayAmount,
//         denomination: topDisplayDenomination,
//       })
//       const topExchangeAmount = nativeToDenominated({
//         nativeAmount: topNativeAmount,
//         denomination: topExchangeDenomination,
//       })
//       const bottomExchangeAmount = await account.rateCache.convertCurrency(
//         currencyCode,
//         fiatCurrencyCode,
//         Number(topExchangeAmount),
//       )
//       const bottomNativeAmount = denominatedToNative({
//         amount: String(bottomExchangeAmount),
//         denomination: bottomExchangeDenomination,
//       })
//       const bottomDisplayAmount = nativeToDenominated({
//         nativeAmount: bottomNativeAmount,
//         denomination: bottomDisplayDenomination,
//       })

//       setTopDisplayAmount(topDisplayAmount)
//       setBottomDisplayAmount(String(bottomDisplayAmount))

//       onChange(topNativeAmount)
//     }

//     const onBottomChange = async (bottomDisplayAmount: string) => {
//       const bottomNativeAmount = denominatedToNative({
//         amount: bottomDisplayAmount,
//         denomination: bottomDisplayDenomination,
//       })
//       const bottomExchangeAmount = nativeToDenominated({
//         nativeAmount: bottomNativeAmount,
//         denomination: bottomExchangeDenomination,
//       })
//       const topExchangeAmount = await account.rateCache.convertCurrency(
//         fiatCurrencyCode,
//         currencyCode,
//         Number(bottomExchangeAmount),
//       )
//       const topNativeAmount = denominatedToNative({
//         amount: String(topExchangeAmount),
//         denomination: topExchangeDenomination,
//       })
//       const topDisplayAmount = nativeToDenominated({
//         nativeAmount: topNativeAmount,
//         denomination: topDisplayDenomination,
//       })

//       setBottomDisplayAmount(bottomDisplayAmount)
//       setTopDisplayAmount(String(topDisplayAmount))
//       onChange(topNativeAmount)
//     }

//     direction === 'cryptoToFiat' ? onTopChange(topDisplayAmount) : onBottomChange(bottomDisplayAmount)
//   }, [
//     account.rateCache,
//     bottomDisplayAmount,
//     bottomDisplayDenomination,
//     bottomExchangeDenomination,
//     currencyCode,
//     direction,
//     fiatCurrencyCode,
//     onChange,
//     topDisplayAmount,
//     topDisplayDenomination,
//     topExchangeDenomination,
//   ])

//   return {
//     top: {
//       amount: topDisplayAmount,
//       denomination: topDisplayDenomination,
//       setDisplayAmount: setTopDisplayAmount,
//       onChange: (displayAmount: string) => {
//         setDirection('cryptoToFiat')
//         setTopDisplayAmount(displayAmount)
//       },
//     },
//     bottom: {
//       amount: bottomDisplayAmount,
//       denomination: bottomDisplayDenomination,
//       onChange: (displayAmount: string) => {
//         setDirection('fiatToCrypto')
//         setBottomDisplayAmount(displayAmount)
//       },
//     },
//   }
// }
