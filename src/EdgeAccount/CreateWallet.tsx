import { EdgeAccount } from 'edge-core-js'
import { useCreateCurrencyWallet } from 'edge-react-hooks'
import * as React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'

import { Select } from '../Components/Select'
import { FiatInfo, fiatInfos, useDefaultFiatInfo } from '../Fiat'
import { getWalletTypes } from '../utils'

export const CreateWallet: React.FC<{ account: EdgeAccount }> = ({ account }) => {
  const defaultFiatInfo = useDefaultFiatInfo({ account })
  const walletTypes = getWalletTypes(account)
  const { execute: createCurrencyWallet, error, status } = useCreateCurrencyWallet(account)

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
        renderOption={({ display, type, currencyCode }) => (
          <option value={type} key={type}>
            {currencyCode} - {display}
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
