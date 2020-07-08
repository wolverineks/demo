import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import * as Yaob from 'yaob'

export const useWatchAll = (object?: { watch: typeof Yaob.watchMethod }) => {
  const [, rerender] = React.useState({})

  React.useEffect(() => {
    if (!object) return

    const unsubs = Object.keys(object).map((key) =>
      key === 'syncRatio'
        ? () => {
            return undefined
          }
        : object.watch(key, () => rerender({})),
    )

    return () => unsubs.forEach((unsub) => unsub())
  }, [object])
}
