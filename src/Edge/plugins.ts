import { addEdgeCorePlugins, lockEdgeCorePlugins } from 'edge-core-js'
import utxoPlugins from 'edge-currency-plugins'

let locked = false

export const ensureEdgePlugins = () => {
  if (locked) return

  addEdgeCorePlugins(utxoPlugins)
  lockEdgeCorePlugins()
  locked = true
}

ensureEdgePlugins()
