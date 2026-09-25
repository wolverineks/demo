import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../App'
import { useEdgeAccount } from '../auth'
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, Select } from '../components'
import { useCreateCurrencyWallet, useDefaultFiatInfo } from '../hooks'
import { FiatInfo, fiatInfos, getCurrencyInfos } from '../utils'

export const CreateWallet = () => {
  const { defaultFiatInfo, error, onSubmit, setFiatCurrencyCode, setName, setType, status, walletTypes } =
    useCreateWallet()

  return (
    <Form>
      <FormGroup>
        <FormLabel>Name</FormLabel>
        <FormControl
          id={'name'}
          disabled={status === 'loading'}
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

      <Button variant={'primary'} disabled={status === 'loading'} onClick={() => onSubmit()}>
        {status === 'loading' ? '...' : 'Create'}
      </Button>
      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
    </Form>
  )
}

const getWalletTypes = (account: EdgeAccount) => {
  return getCurrencyInfos(account).map(({ displayName, walletType, ...currencyInfo }) => ({
    name: displayName,
    type: walletType,
    ...currencyInfo,
  }))
}

const fiatOptions = (fiatInfo: FiatInfo) => [
  fiatInfo,
  ...fiatInfos.filter(({ currencyCode }) => currencyCode !== fiatInfo.currencyCode),
]

const useCreateWallet = () => {
  const account = useEdgeAccount()
  const defaultFiatInfo = useDefaultFiatInfo()
  const walletTypes = getWalletTypes(account)
  const [, select] = useSelectWallet()

  const {
    mutate: createCurrencyWallet,
    error,
    status,
  } = useCreateCurrencyWallet({
    onSuccess: (wallet) => select({ id: wallet.id, tokenId: null }),
  })

  const [type, setType] = React.useState(walletTypes[0].type)
  const [name, setName] = React.useState('')
  const [fiatCurrencyCode, setFiatCurrencyCode] = React.useState('')

  const onSubmit = () => createCurrencyWallet({ type, options: { name, fiatCurrencyCode } })

  return {
    defaultFiatInfo,
    error,
    onSubmit,
    setFiatCurrencyCode,
    setName,
    setType,
    status,
    walletTypes,
  }
}
