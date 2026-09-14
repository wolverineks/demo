import { addEdgeCorePlugins, lockEdgeCorePlugins } from 'edge-core-js'
import { ethereum } from 'edge-currency-accountbased/lib/ethereum/info/ethereumInfo'
import utxoPlugins from 'edge-currency-plugins'

let locked = false

export const ensureEdgePlugins = () => {
  if (locked) return

  addEdgeCorePlugins(utxoPlugins)
  addEdgeCorePlugins({ ethereum })
  lockEdgeCorePlugins()
  locked = true
}

ensureEdgePlugins()
