import { EdgeDenomination } from 'edge-core-js'

const toCountryCode = (currencyCode: string) => currencyCode.slice(0, 2)

export type FiatInfo = {
  currencyCode: string
  isoCurrencyCode: string
  symbol: string
  symbolImage: string
  denominations: EdgeDenomination[]
  displayName: string
}
export const fiatInfos: FiatInfo[] = [
  { currencyCode: 'AED', symbol: 'Ø¯.Ø¥' },
  { currencyCode: 'AFN', symbol: 'Ø' },
  { currencyCode: 'ALL', symbol: 'L' },
  { currencyCode: 'AMD', symbol: 'Ö' },
  { currencyCode: 'ANG', symbol: 'Æ' },
  { currencyCode: 'AOA', symbol: 'Kz' },
  { currencyCode: 'ARS', symbol: '$' },
  { currencyCode: 'AUD', symbol: '$' },
  { currencyCode: 'AWG', symbol: 'Æ' },
  { currencyCode: 'AZN', symbol: 'â¼' },
  { currencyCode: 'BAM', symbol: 'KM' },
  { currencyCode: 'BBD', symbol: '$' },
  { currencyCode: 'BDT', symbol: 'à§³' },
  { currencyCode: 'BGN', symbol: 'Ð»Ð²' },
  { currencyCode: 'BIF', symbol: 'Fr' },
  { currencyCode: 'BMD', symbol: '$' },
  { currencyCode: 'BND', symbol: '$' },
  { currencyCode: 'BOB', symbol: 'Bs.' },
  { currencyCode: 'BRL', symbol: 'R$' },
  { currencyCode: 'BSD', symbol: '$' },
  { currencyCode: 'BTN', symbol: 'Nu.' },
  { currencyCode: 'BWP', symbol: 'P' },
  { currencyCode: 'BYN', symbol: 'Br' },
  { currencyCode: 'BZD', symbol: '$' },
  { currencyCode: 'CAD', symbol: '$' },
  { currencyCode: 'CDF', symbol: 'Fr' },
  { currencyCode: 'CHF', symbol: 'Fr' },
  { currencyCode: 'CLP', symbol: '$' },
  { currencyCode: 'CNY', symbol: 'Â¥' },
  { currencyCode: 'COP', symbol: '$' },
  { currencyCode: 'CRC', symbol: 'â¡' },
  { currencyCode: 'CUC', symbol: '$' },
  { currencyCode: 'CUP', symbol: '$' },
  { currencyCode: 'CVE', symbol: '$' },
  { currencyCode: 'CZK', symbol: 'KÄ' },
  { currencyCode: 'DJF', symbol: 'Fr' },
  { currencyCode: 'DKK', symbol: 'kr' },
  { currencyCode: 'DOP', symbol: '$' },
  { currencyCode: 'DZD', symbol: 'Ø¯.Ø¬' },
  { currencyCode: 'EGP', symbol: 'Ø¬.Ù' },
  { currencyCode: 'ERN', symbol: 'Nfk' },
  { currencyCode: 'ETB', symbol: 'Br' },
  { currencyCode: 'EUR', symbol: 'â¬' },
  { currencyCode: 'FJD', symbol: '$' },
  { currencyCode: 'FKP', symbol: 'Â£' },
  { currencyCode: 'GBP', symbol: 'Â£' },
  { currencyCode: 'GEL', symbol: 'â¾' },
  { currencyCode: 'GGP', symbol: 'Â£' },
  { currencyCode: 'GHS', symbol: 'âµ' },
  { currencyCode: 'GIP', symbol: 'Â£' },
  { currencyCode: 'GMD', symbol: 'D' },
  { currencyCode: 'GNF', symbol: 'Fr' },
  { currencyCode: 'GTQ', symbol: 'Q' },
  { currencyCode: 'GYD', symbol: '$' },
  { currencyCode: 'HKD', symbol: '$' },
  { currencyCode: 'HNL', symbol: 'L' },
  { currencyCode: 'HRK', symbol: 'kn' },
  { currencyCode: 'HTG', symbol: 'G' },
  { currencyCode: 'HUF', symbol: 'Ft' },
  { currencyCode: 'IDR', symbol: 'Rp' },
  { currencyCode: 'ILS', symbol: 'âª' },
  { currencyCode: 'IMP', symbol: 'Â£' },
  { currencyCode: 'INR', symbol: 'â¹' },
  { currencyCode: 'IQD', symbol: 'Ø¹.Ø¯' },
  { currencyCode: 'IRR', symbol: 'ï·¼' },
  { currencyCode: 'ISK', symbol: 'kr' },
  { currencyCode: 'JEP', symbol: 'Â£' },
  { currencyCode: 'JMD', symbol: '$' },
  { currencyCode: 'JOD', symbol: 'Ø¯.Ø§' },
  { currencyCode: 'JPY', symbol: 'Â¥' },
  { currencyCode: 'KES', symbol: 'Sh' },
  { currencyCode: 'KGS', symbol: 'Ñ' },
  { currencyCode: 'KHR', symbol: 'á' },
  { currencyCode: 'KMF', symbol: 'Fr' },
  { currencyCode: 'KPW', symbol: 'â©' },
  { currencyCode: 'KRW', symbol: 'â©' },
  { currencyCode: 'KWD', symbol: 'Ø¯.Ù' },
  { currencyCode: 'KYD', symbol: '$' },
  { currencyCode: 'KZT', symbol: 'â¸' },
  { currencyCode: 'LAK', symbol: 'â­' },
  { currencyCode: 'LBP', symbol: 'Ù.Ù' },
  { currencyCode: 'LKR', symbol: 'Rs' },
  { currencyCode: 'LRD', symbol: '$' },
  { currencyCode: 'LSL', symbol: 'L' },
  { currencyCode: 'LYD', symbol: 'Ù.Ø¯' },
  { currencyCode: 'MAD', symbol: 'Ø¯. Ù.' },
  { currencyCode: 'MDL', symbol: 'L' },
  { currencyCode: 'MGA', symbol: 'Ar' },
  { currencyCode: 'MKD', symbol: 'Ð´ÐµÐ½' },
  { currencyCode: 'MMK', symbol: 'Ks' },
  { currencyCode: 'MNT', symbol: 'â®' },
  { currencyCode: 'MOP', symbol: 'P' },
  { currencyCode: 'MRO', symbol: 'UM' },
  { currencyCode: 'MRU', symbol: 'UM' },
  { currencyCode: 'MUR', symbol: 'â¨' },
  { currencyCode: 'MWK', symbol: 'MK' },
  { currencyCode: 'MXN', symbol: '$' },
  { currencyCode: 'MYR', symbol: 'RM' },
  { currencyCode: 'MZN', symbol: 'MT' },
  { currencyCode: 'NAD', symbol: '$' },
  { currencyCode: 'NGN', symbol: 'â¦' },
  { currencyCode: 'NIO', symbol: 'C$' },
  { currencyCode: 'NOK', symbol: 'kr' },
  { currencyCode: 'NPR', symbol: 'â¨' },
  { currencyCode: 'NZD', symbol: '$' },
  { currencyCode: 'OMR', symbol: 'Ø±.Ø¹.' },
  { currencyCode: 'PAB', symbol: 'B/.' },
  { currencyCode: 'PEN', symbol: 'S/.' },
  { currencyCode: 'PGK', symbol: 'K' },
  { currencyCode: 'PHP', symbol: 'â±' },
  { currencyCode: 'PKR', symbol: 'â¨' },
  { currencyCode: 'PLN', symbol: 'zÅ' },
  { currencyCode: 'PRB', symbol: 'Ñ.' },
  { currencyCode: 'PYG', symbol: 'â²' },
  { currencyCode: 'QAR', symbol: 'Ø±.Ù' },
  { currencyCode: 'RON', symbol: 'lei' },
  { currencyCode: 'RSD', symbol: 'Ð´Ð¸Ð½' },
  { currencyCode: 'RUB', symbol: 'â½' },
  { currencyCode: 'RWF', symbol: 'Fr' },
  { currencyCode: 'SAR', symbol: 'Ø±.Ø³' },
  { currencyCode: 'SBD', symbol: '$' },
  { currencyCode: 'SCR', symbol: 'â¨' },
  { currencyCode: 'SDG', symbol: 'Ø¬.Ø³.' },
  { currencyCode: 'SEK', symbol: 'kr' },
  { currencyCode: 'SGD', symbol: '$' },
  { currencyCode: 'SHP', symbol: 'Â£' },
  { currencyCode: 'SLL', symbol: 'Le' },
  { currencyCode: 'SOS', symbol: 'Sh' },
  { currencyCode: 'SRD', symbol: '$' },
  { currencyCode: 'SSP', symbol: 'Â£' },
  { currencyCode: 'STD', symbol: 'Db' },
  { currencyCode: 'SYP', symbol: 'Ù.Ø³' },
  { currencyCode: 'SZL', symbol: 'L' },
  { currencyCode: 'THB', symbol: 'à¸¿' },
  { currencyCode: 'TJS', symbol: 'ÐÐ' },
  { currencyCode: 'TMT', symbol: 'm' },
  { currencyCode: 'TND', symbol: 'Ø¯.Øª' },
  { currencyCode: 'TOP', symbol: 'T$' },
  { currencyCode: 'TRY', symbol: 'âº' },
  { currencyCode: 'TTD', symbol: '$' },
  { currencyCode: 'TVD', symbol: '$' },
  { currencyCode: 'TWD', symbol: '$' },
  { currencyCode: 'TZS', symbol: 'Sh' },
  { currencyCode: 'UAH', symbol: 'â´' },
  { currencyCode: 'UGX', symbol: 'Sh' },
  { currencyCode: 'USD', symbol: '$' },
  { currencyCode: 'UYU', symbol: '$' },
  { currencyCode: 'UZS', symbol: '' },
  { currencyCode: 'VEF', symbol: 'Bs' },
  { currencyCode: 'VND', symbol: 'â«' },
  { currencyCode: 'VUV', symbol: 'Vt' },
  { currencyCode: 'WST', symbol: 'T' },
  { currencyCode: 'XAF', symbol: 'Fr' },
  { currencyCode: 'XCD', symbol: '$' },
  { currencyCode: 'XOF', symbol: 'Fr' },
  { currencyCode: 'XPF', symbol: 'Fr' },
  { currencyCode: 'YER', symbol: 'ï·¼' },
  { currencyCode: 'ZAR', symbol: 'R' },
  { currencyCode: 'ZMW', symbol: 'ZK' },
].map((info) => ({
  ...info,
  denominations: [
    { name: info.currencyCode, symbol: info.symbol, multiplier: '1' },
    { name: info.currencyCode, symbol: `c${info.symbol}`, multiplier: '.01' },
    { name: info.currencyCode, symbol: `m${info.symbol}`, multiplier: '.001' },
  ],
  symbolImage: `https://www.countryflags.io/${toCountryCode(info.currencyCode)}/flat/64.png`,
  isoCurrencyCode: `iso:${info.currencyCode}`,
  displayName: info.currencyCode,
}))
