import React from 'react'

import { useEdgeAccount } from '../auth'
import { Image } from '../components'
import { useInfo } from '../hooks'
import { UNKNOWN_CURRENCY_ICON, getCurrencyIconUri } from '../utils'

export const Logo: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)
  const pluginId = 'pluginId' in info ? (info as { pluginId?: string }).pluginId : undefined
  const remoteIcon = getCurrencyIconUri(pluginId, currencyCode)
  const [src, setSrc] = React.useState(info.symbolImage || remoteIcon)

  React.useEffect(() => {
    setSrc(info.symbolImage || remoteIcon)
  }, [info.symbolImage, remoteIcon])

  return (
    <Image
      alt={currencyCode}
      src={src}
      className="currency-logo"
      onError={() => {
        setSrc((current) => {
          if (current !== remoteIcon) return remoteIcon
          if (current !== UNKNOWN_CURRENCY_ICON) return UNKNOWN_CURRENCY_ICON

          return current
        })
      }}
    />
  )
}
