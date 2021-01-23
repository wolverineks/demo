import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Button, FormGroup } from 'react-bootstrap'

import { Select } from '../components'
import { useFiatCurrencyCode } from '../hooks'
import { fiatInfos } from '../utils'

export const FiatCurrencyCode: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [fiatCurrencyCode, setFiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [_fiatCurrencyCode, _setFiatCurrencyCode] = React.useState(fiatCurrencyCode)

  return (
    <FormGroup>
      <Select
        defaultValue={fiatCurrencyCode}
        onSelect={(event) => _setFiatCurrencyCode(event.currentTarget.value)}
        title={`FiatCurrencyCode: ${fiatCurrencyCode}`}
        options={fiatInfos}
        renderOption={({ currencyCode, isoCurrencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        )}
      />

      <Button onClick={() => setFiatCurrencyCode(_fiatCurrencyCode)}>Set Fiat</Button>
    </FormGroup>
  )
}
