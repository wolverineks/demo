declare module 'edge-currency-plugins'
declare module 'edge-currency-accountbased'
declare module 'edge-currency-accountbased/lib/ethereum/info/ethereumInfo' {
  import type { EdgeCorePluginOptions, EdgeCurrencyPlugin } from 'edge-core-js/types'

  export const ethereum: (env: EdgeCorePluginOptions) => EdgeCurrencyPlugin
}
declare module 'edge-exchange-plugins'
