import { EdgeCurrencyWallet } from 'edge-core-js'
import { useOnNewTransactions, useRenameWallet } from 'edge-react-hooks'
import React from 'react'
import { Button, Card, Form, FormControl, FormGroup, FormLabel, ListGroup, Tab, Tabs } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, Logo } from '../components'
import { fiatInfos } from '../Fiat'
import { useFiatCurrencyCode, useName, useTokens } from '../hooks'
import { Disklet } from '../Storage/Disklet'
import { getTokenInfo } from '../utils'
import { Request } from './Request'
import { Send } from './Send'
import { TransactionList } from './TransactionList'

export const WalletInfo: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  return (
    <Tabs id={'walletTabs'} defaultActiveKey={'history'} key={wallet.id}>
      <Tab eventKey={'history'} title={'History'}>
        <Boundary>
          <TransactionList wallet={wallet} />
        </Boundary>
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Boundary>
          <Send wallet={wallet} />
        </Boundary>
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Boundary>
          <Request wallet={wallet} />
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Disklet disklet={wallet.disklet} path={'/'} title={'Disklet'} />
        </Boundary>

        <Boundary>
          <Disklet disklet={wallet.localDisklet} path={'/'} title={'Local Disklet'} />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Boundary>
          <Settings wallet={wallet} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}

const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const { availableTokens, enabledTokens, enableToken, disableToken } = useTokens(wallet)

  const toggleToken = React.useCallback(
    (currencyCode: string) =>
      enabledTokens.includes(currencyCode) ? disableToken(currencyCode) : enableToken(currencyCode),
    [disableToken, enableToken, enabledTokens],
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title>Tokens</Card.Title>
      </Card.Header>

      {availableTokens.length <= 0 ? (
        <Card.Text>No Tokens Available</Card.Text>
      ) : (
        <ListGroup>
          {availableTokens.map((currencyCode) => (
            <TokenRow
              key={currencyCode}
              currencyCode={currencyCode}
              isEnabled={enabledTokens.includes(currencyCode)}
              onClick={toggleToken}
            />
          ))}
        </ListGroup>
      )}
    </Card>
  )
}

const TokenRow: React.FC<{
  currencyCode: string
  isEnabled: boolean
  onClick: (currencyCode: string) => void
}> = ({ currencyCode, isEnabled, onClick }) => {
  const { currencyName } = getTokenInfo(useAccount(), currencyCode)

  return (
    <ListGroup.Item
      key={currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(currencyCode)}
    >
      <Logo currencyCode={currencyCode} /> {currencyCode} - {currencyName}
    </ListGroup.Item>
  )
}

const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [name, setName] = React.useState<string>(useName(wallet) || '')
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
      <FormLabel htmlFor={'walletFiatCurrencyCode'}>FiatCurrencyCode</FormLabel>
      <FormControl
        as={'select'}
        defaultValue={fiatCurrencyCode}
        id={'walletFiatCurrencyCode'}
        onChange={(event) => _setFiatCurrencyCode(event.currentTarget.value)}
      >
        {fiatInfos.map(({ currencyCode, isoCurrencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        ))}
      </FormControl>
      <Button onClick={() => write(_fiatCurrencyCode)}>Set Fiat</Button>
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

const Settings: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [query, setQuery] = React.useState('')

  return (
    <>
      <FormControl placeholder={'filter'} onChange={(event) => setQuery(event.currentTarget.value)} />

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

      <Tokens wallet={wallet} />
    </>
  )
}

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (query: string, target: string) => normalize(target).includes(normalize(query))

const Matcher: React.FC<{ query: string; match: string }> = ({ children, query, match }) => (
  <>{matches(query, match) ? children : null}</>
)
