import pkg from '../../package.json'

const versions = pkg.dependencies as Record<string, string>

export const libraryVersions: { name: string; version: string }[] = [
  { name: 'edge-core-js', version: versions['edge-core-js'] },
  { name: 'edge-currency-accountbased', version: versions['edge-currency-accountbased'] },
  { name: 'edge-currency-plugins', version: versions['edge-currency-plugins'] },
  { name: 'edge-exchange-plugins', version: versions['edge-exchange-plugins'] },
]
