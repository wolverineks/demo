import { EdgeCorePlugins } from 'edge-core-js'
import AccountBased from 'edge-currency-accountbased'
import Bitcoin from 'edge-currency-bitcoin'
// import Monero from 'edge-currency-monero'
import exchangePlugins from 'edge-exchange-plugins'

export const plugins: EdgeCorePlugins[] = [
  Bitcoin,
  // Monero,
  AccountBased,
  exchangePlugins,
]
