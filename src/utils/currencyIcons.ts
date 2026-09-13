const EDGE_ICON_SERVER = 'https://content.edge.app/currencyIconsV3'
const GENERIC_ICON_SERVER = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color'

export const UNKNOWN_CURRENCY_ICON = '/unknown-currency.png'

export const getCurrencyIconUri = (pluginId?: string, currencyCode?: string) => {
  if (pluginId) {
    const id = pluginId.toLowerCase()

    return `${EDGE_ICON_SERVER}/${id}/${id}.png`
  }

  if (currencyCode) {
    return `${GENERIC_ICON_SERVER}/${currencyCode.toLowerCase()}.png`
  }

  return UNKNOWN_CURRENCY_ICON
}
