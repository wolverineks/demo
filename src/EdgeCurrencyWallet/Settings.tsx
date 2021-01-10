import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useRenameWallet } from 'edge-react-hooks'
import React from 'react'
import { Button, Card, Form, FormControl, FormGroup, FormLabel, ListGroup } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Boundary, Logo, Select } from '../components'
import { fiatInfos } from '../Fiat'
import { useFiatCurrencyCode, useTokens } from '../hooks'
import { useFilter } from './useFilter'

const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [name, setName] = React.useState<string>(wallet.name || '')
  const { execute, status } = useRenameWallet(wallet)

  return (
    <FormGroup>
      <Form.Label>Wallet Name</Form.Label>
      <FormControl value={name} onChange={(event) => setName(event.currentTarget.value)} />
      <Button onClick={() => execute({ name })} disabled={status === 'loading'}>
        Rename
      </Button>
    </FormGroup>
  )
}

const SetFiatCurrencyCode: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [fiatCurrencyCode, write] = useFiatCurrencyCode(wallet)
  const [_fiatCurrencyCode, _setFiatCurrencyCode] = React.useState(fiatCurrencyCode)

  return (
    <FormGroup>
      <Select
        defaultValue={fiatCurrencyCode}
        onSelect={(event) => _setFiatCurrencyCode(event.currentTarget.value)}
        title={'FiatCurrencyCode'}
        options={fiatInfos}
        renderOption={({ currencyCode, isoCurrencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        )}
      />

      <Button onClick={() => write(_fiatCurrencyCode)}>Set Fiat</Button>
    </FormGroup>
  )
}

const RawKey: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showRawKey, setShowRawKey] = React.useState(false)
  const rawKey = useEdgeAccount().allKeys.find(({ id }) => id === wallet.id)!

  return (
    <FormGroup>
      <FormLabel>Raw Key</FormLabel>
      {showRawKey && <JSONPretty json={rawKey} />}
      <br />
      <Button onClick={() => setShowRawKey((x) => !x)}>Show Raw Key</Button>
    </FormGroup>
  )
}

const PrivateSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showPrivateSeed, setShowPrivateSeed] = React.useState(false)

  return (
    <FormGroup>
      <FormLabel>Private Seed</FormLabel>
      <FormControl readOnly value={showPrivateSeed ? wallet.getDisplayPrivateSeed() || '' : ''} />
      <Button onClick={() => setShowPrivateSeed((x) => !x)}>Show Private Seed</Button>
    </FormGroup>
  )
}

const PublicSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showPublicSeed, setShowPublicSeed] = React.useState(false)

  return (
    <FormGroup>
      <FormLabel>Public Seed</FormLabel>
      <FormControl readOnly value={showPublicSeed ? wallet.getDisplayPublicSeed() || '' : ''} />
      <Button onClick={() => setShowPublicSeed((x) => !x)}>Show Public Seed</Button>
    </FormGroup>
  )
}

const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  const { enabledTokens, enableToken, disableToken, availableTokenInfos } = useTokens(account, wallet)
  const toggleToken = React.useCallback(
    (currencyCode: string) =>
      enabledTokens.includes(currencyCode) ? disableToken(currencyCode) : enableToken(currencyCode),
    [disableToken, enableToken, enabledTokens],
  )
  const matches = (query: string) => (token: EdgeMetaToken): boolean => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return (
      normalize(token.currencyCode).includes(normalize(query)) ||
      normalize(token.currencyName).includes(normalize(query)) ||
      normalize(token.contractAddress || '').includes(normalize(query))
    )
  }
  const [visibleTokens, setSearchQuery] = useFilter(matches, availableTokenInfos)

  return (
    <Card>
      <Card.Header>
        <Card.Title>Tokens</Card.Title>
      </Card.Header>
      <ListGroup>
        <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
        {visibleTokens.length <= 0 ? (
          <ListGroup.Item>No Tokens Available</ListGroup.Item>
        ) : (
          [...visibleTokens]
            .sort()
            .map((tokenInfo) => (
              <TokenRow
                key={tokenInfo.currencyCode}
                tokenInfo={tokenInfo}
                isEnabled={enabledTokens.includes(tokenInfo.currencyCode)}
                onClick={toggleToken}
              />
            ))
        )}
      </ListGroup>
    </Card>
  )
}

const TokenRow: React.FC<{
  tokenInfo: EdgeMetaToken
  isEnabled: boolean
  onClick: (currencyCode: string) => void
}> = ({ tokenInfo, isEnabled, onClick }) => {
  const { currencyName } = tokenInfo

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Logo currencyCode={tokenInfo.currencyCode} /> {tokenInfo.currencyCode} - {currencyName}
    </ListGroup.Item>
  )
}

const Matcher: React.FC<{ query: string; match: string }> = ({ children, query, match }) => {
  const matches = (query: string, target: string) => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return normalize(target).includes(normalize(query))
  }

  return <>{matches(query, match) ? children : null}</>
}

export const Settings: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [query, setQuery] = React.useState('')

  return (
    <>
      <FormControl placeholder={'Search'} onChange={(event) => setQuery(event.currentTarget.value)} />

      <Matcher query={query} match={'rename wallet'}>
        <RenameWallet wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'fiat currency Code'}>
        <SetFiatCurrencyCode wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'private seed'}>
        <PrivateSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'public seed'}>
        <PublicSeed wallet={wallet} />
      </Matcher>

      <Matcher query={query} match={'raw key'}>
        <RawKey wallet={wallet} />
      </Matcher>

      <Boundary>
        <Tokens wallet={wallet} />
      </Boundary>
    </>
  )
}
