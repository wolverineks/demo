import { version as core } from 'edge-core-js/package.json'
import { version as accountbased } from 'edge-currency-accountbased/package.json'
import { version as bitcoin } from 'edge-currency-bitcoin/package.json'
import { version as monero } from 'edge-currency-monero/package.json'
import { version as exchange } from 'edge-exchange-plugins/package.json'

export const libraryVersions: { name: string; version: string }[] = [
  { name: 'edge-core-js', version: core },
  { name: 'edge-currency-accountbased', version: accountbased },
  { name: 'edge-currency-bitcoin', version: bitcoin },
  { name: 'edge-currency-monero', version: monero },
  { name: 'edge-exchange-plugins', version: exchange },
]
