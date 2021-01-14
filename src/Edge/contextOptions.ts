export const currencyPlugins = {
  // edge-currency-accountbased:
  binance: true,
  eos: true,
  ethereum: true,
  ethereumclassic: true,
  fio: true,
  ripple: true,
  rsk: true,
  stellar: true,
  tezos: true,
  // edge-currency-bitcoin:
  bitcoin: true,
  bitcoincash: true,
  bitcoincashtestnet: false,
  bitcoingold: true,
  bitcoingoldtestnet: false,
  bitcoinsv: true,
  bitcointestnet: true,
  dash: true,
  digibyte: true,
  dogecoin: true,
  eboost: true,
  feathercoin: true,
  groestlcoin: true,
  litecoin: true,
  qtum: true,
  ravencoin: true,
  smartcash: true,
  ufo: true,
  vertcoin: true,
  zcoin: true,
  // edge-currency-monero:
  monero: true,
}

export const ratePlugins = {
  'shapeshift-rate': false,
  compound: true,
  coinbase: true,
  coincap: true,
  constantRate: true,
  coincapLegacy: false,
  xagau: false,
  wazirx: true,
}

export const swapPlugins = {
  // transfer: true,
}

export const contextOptions = {
  // apiKey: 'cfcc4514d85fff7cb3e2e7ef5dee3b827270d030',
  apiKey: 'f950db17e3aa919b6bb17b634b541caf1db4536a',
  appId: '',
  plugins: {
    ...currencyPlugins,
    ...ratePlugins,
    ...swapPlugins,
  },
}
