import { addEdgeCorePlugins, lockEdgeCorePlugins } from 'edge-core-js'
import { ethereum } from 'edge-currency-accountbased/lib/ethereum/info/ethereumInfo'
import { optimism } from 'edge-currency-accountbased/lib/ethereum/info/optimismInfo'
import { polygon } from 'edge-currency-accountbased/lib/ethereum/info/polygonInfo'
import utxoPlugins from 'edge-currency-plugins'
import { makeGodexPlugin } from 'edge-exchange-plugins/lib/swap/central/godex'
import { makeTransferPlugin } from 'edge-exchange-plugins/lib/swap/transfer'

let locked = false

export const ensureEdgePlugins = () => {
  if (locked) return

  addEdgeCorePlugins(utxoPlugins)
  addEdgeCorePlugins({
    ethereum,
    polygon,
    optimism,
    transfer: makeTransferPlugin,
    godex: makeGodexPlugin,
  })
  lockEdgeCorePlugins()
  locked = true
}

ensureEdgePlugins()
