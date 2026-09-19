export const currencyPlugins = {
  ethereum: true,
  polygon: true,
  optimism: true,
  bitcoin: true,
  bitcoincash: true,
  bitcoingold: true,
  bitcoinsv: true,
  dash: true,
  digibyte: true,
  dogecoin: true,
  eboost: true,
  ecash: true,
  feathercoin: true,
  groestlcoin: true,
  litecoin: true,
  qtum: true,
  ravencoin: true,
  ufo: true,
  vertcoin: true,
  zcoin: true,
}

export const swapPlugins = {
  transfer: true,
  godex: true,
}

export const contextOptions = {
  apiKey: 'f950db17e3aa919b6bb17b634b541caf1db4536a',
  appId: '',
  plugins: {
    ...currencyPlugins,
    ...swapPlugins,
  },
}
