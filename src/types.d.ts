declare module 'edge-currency-plugins'
declare module 'edge-currency-accountbased'
declare module 'edge-currency-accountbased/lib/ethereum/info/ethereumInfo' {
  import type { EdgeCorePluginOptions, EdgeCurrencyPlugin } from 'edge-core-js/types'

  export const ethereum: (env: EdgeCorePluginOptions) => EdgeCurrencyPlugin
}
declare module 'edge-exchange-plugins'
declare module 'edge-exchange-plugins/lib/swap/transfer' {
  import type { EdgeCorePluginOptions, EdgeSwapPlugin } from 'edge-core-js/types'

  export function makeTransferPlugin(env: EdgeCorePluginOptions): EdgeSwapPlugin
}
declare module 'edge-exchange-plugins/lib/swap/central/godex' {
  import type { EdgeCorePluginOptions, EdgeSwapPlugin } from 'edge-core-js/types'

  export function makeGodexPlugin(env: EdgeCorePluginOptions): EdgeSwapPlugin
}
