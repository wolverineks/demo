import { EdgeCurrencyWallet } from 'edge-core-js'
import { useOnNewTransactions, useRenameWallet } from 'edge-react-hooks'
import React from 'react'
import { Button, Card, Form, FormControl, FormGroup, FormLabel, ListGroup, Tab, Tabs } from 'react-bootstrap'

import { useAccount } from '../auth'
import { fiatInfos } from '../Fiat'
import { useFiatCurrencyCode, useName, useTokens } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { Disklet } from '../Storage/Disklet'
import { getTokenInfo } from '../utils'
import { BalanceList } from './BalanceList'
import { Request } from './Request'
import { Send } from './Send'
import { TransactionList } from './TransactionList'

export const WalletInfo: React.FC = () => {
  const wallet = useSelectedWallet()
  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  return (
    <Tabs variant={'pills'} id={'walletTabs'} defaultActiveKey={'balance'} key={wallet.id}>
      <Tab eventKey={'balance'} title={'Balance'}>
        <BalanceList wallet={wallet} />
        <TransactionList wallet={wallet} />
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Send wallet={wallet} />
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Request wallet={wallet} />
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Disklet disklet={wallet.disklet} path={'/'} title={'Disklet'} />
        <Disklet disklet={wallet.localDisklet} path={'/'} title={'Local Disklet'} />
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Settings wallet={wallet} />
      </Tab>
    </Tabs>
  )
}

const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const { availableTokens } = useTokens(wallet)

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
            <TokenRow key={currencyCode} currencyCode={currencyCode} wallet={wallet} />
          ))}
        </ListGroup>
      )}
    </Card>
  )
}

const TokenRow: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const { enabledTokens, enableTokens, disableTokens } = useTokens(wallet)
  const { currencyName } = getTokenInfo(useAccount(), currencyCode)

  const toggleToken = (currencyCode: string) => () => {
    enabledTokens.includes(currencyCode) ? disableTokens(currencyCode) : enableTokens(currencyCode)
  }

  return (
    <ListGroup.Item
      key={currencyCode}
      variant={enabledTokens.includes(currencyCode) ? 'primary' : undefined}
      onClick={toggleToken(currencyCode)}
    >
      {currencyCode} - {currencyName}
    </ListGroup.Item>
  )
}

const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [walletName, setWalletName] = React.useState<string>(useName(wallet) || '')
  const { execute, status } = useRenameWallet(wallet)

  return (
    <FormGroup>
      <Form.Label>Wallet Name</Form.Label>
      <FormControl value={walletName} onChange={(event) => setWalletName(event.currentTarget.value)} />
      <Button onClick={() => execute({ name: walletName })} disabled={status === 'loading'}>
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

const WalletOptions: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => (
  <Form>
    <RenameWallet wallet={wallet} />
    <SetFiatCurrencyCode wallet={wallet} />
  </Form>
)

const DisplayKeys: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showPrivateSeed, setShowPrivateSeed] = React.useState(false)
  const [showPublicSeed, setShowPublicSeed] = React.useState(false)

  return (
    <Form>
      <FormGroup>
        <FormLabel>Private Seed</FormLabel>
        <FormControl readOnly value={showPrivateSeed ? wallet.getDisplayPrivateSeed() || '' : ''} />
        <Button onClick={() => setShowPrivateSeed((x) => !x)}>Show Private Seed</Button>
      </FormGroup>

      <FormGroup>
        <FormLabel>Public Seed</FormLabel>
        <FormControl readOnly value={showPublicSeed ? wallet.getDisplayPublicSeed() || '' : ''} />
        <Button onClick={() => setShowPublicSeed((x) => !x)}>Show Public Seed</Button>
      </FormGroup>
    </Form>
  )
}

const Settings: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  return (
    <>
      <WalletOptions wallet={wallet} />
      <DisplayKeys wallet={wallet} />
      <Tokens wallet={wallet} />
    </>
  )
}
