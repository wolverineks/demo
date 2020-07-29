import { useCreateCurrencyWallet } from 'edge-react-hooks'
import React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Select } from '../components'
import { FiatInfo, fiatInfos } from '../Fiat'
import { useDefaultFiatInfo } from '../hooks'
import { getWalletTypes } from '../utils'

export const CreateWallet: React.FC = () => {
  const defaultFiatInfo = useDefaultFiatInfo(useAccount())
  const walletTypes = getWalletTypes(useAccount())
  const { execute: createCurrencyWallet, error, status } = useCreateCurrencyWallet(useAccount())

  const [type, setType] = React.useState<string>(walletTypes[0].type)
  const [name, setName] = React.useState<string>('')
  const [fiatCurrencyCode, setFiatCurrencyCode] = React.useState<string>('')

  const onSubmit = () => createCurrencyWallet({ type, options: { name, fiatCurrencyCode } })

  return (
    <Form>
      <FormGroup>
        <FormLabel>Name</FormLabel>
        <FormControl
          id={'name'}
          disabled={status === 'loading'}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </FormGroup>

      <Select
        title={'Type'}
        disabled={status === 'loading'}
        onSelect={(event) => setType(event.currentTarget.value)}
        options={walletTypes}
        renderOption={({ name, type, currencyCode }) => (
          <option value={type} key={type}>
            {currencyCode} - {name}
          </option>
        )}
      />

      <Select
        title={'FiatCurrencyCode'}
        disabled={status === 'loading'}
        defaultValue={defaultFiatInfo.isoCurrencyCode}
        onSelect={(event) => setFiatCurrencyCode(event.currentTarget.value)}
        options={displayFiatInfos(defaultFiatInfo)}
        renderOption={({ isoCurrencyCode, currencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        )}
      />

      <Button variant={'primary'} disabled={status === 'loading'} onClick={onSubmit}>
        {status === 'loading' ? '...' : 'Create'}
      </Button>
      {error && <Alert variant={'danger'}>{error.message}</Alert>}
    </Form>
  )
}

const displayFiatInfos = (fiatInfo?: FiatInfo) =>
  fiatInfo ? [fiatInfo, ...fiatInfos.filter(({ currencyCode }) => currencyCode !== fiatInfo.currencyCode)] : fiatInfos
