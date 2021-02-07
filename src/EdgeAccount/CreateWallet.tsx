import React from 'react'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Select } from '../components'
import { useCreateCurrencyWallet, useDefaultFiatInfo } from '../hooks'
import { FiatInfo, fiatInfos, getWalletTypes } from '../utils'

export const CreateWallet = () => {
  const account = useEdgeAccount()
  const defaultFiatInfo = useDefaultFiatInfo(account)
  const walletTypes = getWalletTypes(account)
  const { mutate: createCurrencyWallet, error, status } = useCreateCurrencyWallet(account)

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
        options={fiatOptions(defaultFiatInfo)}
        renderOption={({ isoCurrencyCode, currencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        )}
      />

      <Button variant={'primary'} disabled={status === 'loading'} onClick={onSubmit}>
        {status === 'loading' ? '...' : 'Create'}
      </Button>
      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
    </Form>
  )
}

const fiatOptions = (fiatInfo: FiatInfo) => [
  fiatInfo,
  ...fiatInfos.filter(({ currencyCode }) => currencyCode !== fiatInfo.currencyCode),
]
