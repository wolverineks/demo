import { EdgeMetaToken } from 'edge-core-js'
import {
  useDisableTokens,
  useEnableTokens,
  useOnNewTransactions,
  useRenameWallet,
  useSetFiatCurrencyCode,
} from 'edge-react-hooks'
import * as React from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  Image,
  ListGroup,
  Tab,
  Tabs,
} from 'react-bootstrap'

import { fiatInfos } from '../Fiat'
import { useEnabledTokens } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { Disklet } from '../Storage/Disklet'
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
    <Tabs variant={'pills'} id={'walletTabs'} defaultActiveKey={'balance'}>
      <Tab eventKey={'balance'} title={'Balance'}>
        <BalanceList />
        <TransactionList key={wallet.id} />
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Send key={wallet.id} />
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Request key={wallet.id} />
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Disklet disklet={wallet.disklet} path={'/'} title={'Disklet'} />
        <Disklet disklet={wallet.localDisklet} path={'/'} title={'Local Disklet'} />
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Settings />
      </Tab>
    </Tabs>
  )
}

const Tokens: React.FC = () => {
  const wallet = useSelectedWallet()

  const availableTokens = wallet.currencyInfo.metaTokens
  const enabledTokens = useEnabledTokens({ wallet })
  const enableTokens = useEnableTokens(wallet)
  const disableTokens = useDisableTokens(wallet)
  const pending = enableTokens.status === 'loading' || disableTokens.status === 'loading'

  const toggleToken = (token: EdgeMetaToken) => () => {
    enabledTokens.includes(token.currencyCode)
      ? disableTokens.execute({ tokens: [token.currencyCode] })
      : enableTokens.execute({ tokens: [token.currencyCode] })
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Tokens</Card.Title>
      </Card.Header>

      {availableTokens.length <= 0 ? (
        <Card.Text>No Tokens Available</Card.Text>
      ) : (
        <ListGroup>
          {availableTokens.map((token) => (
            <ListGroup.Item
              key={token.currencyCode}
              variant={enabledTokens.includes(token.currencyCode) ? 'primary' : undefined}
              disabled={pending}
              onClick={toggleToken(token)}
            >
              <Image src={token.symbolImage} /> {token.currencyName}
              {token.currencyCode}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Card>
  )
}

const RenameWallet: React.FC = () => {
  const wallet = useSelectedWallet()
  const [walletName, setWalletName] = React.useState<string>(wallet.name || '')
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

const SetFiatCurrencyCode: React.FC = () => {
  const wallet = useSelectedWallet()
  const [fiatCurrencyCode, setFiatCurrencyCode] = React.useState(wallet.fiatCurrencyCode)
  const { execute, status, error } = useSetFiatCurrencyCode(wallet)

  return (
    <FormGroup>
      <FormLabel htmlFor={'fiatCurrencyCodes'}>FiatCurrencyCode</FormLabel>
      <FormControl
        as={'select'}
        defaultValue={wallet.fiatCurrencyCode}
        id={'fiatCurrencyCodes'}
        disabled={status === 'loading'}
        onChange={(event) => setFiatCurrencyCode(event.currentTarget.value)}
      >
        {fiatInfos.map(({ currencyCode, isoCurrencyCode, symbol }) => (
          <option value={isoCurrencyCode} key={isoCurrencyCode}>
            {symbol} - {currencyCode}
          </option>
        ))}
      </FormControl>
      <Button onClick={() => execute({ fiatCurrencyCode })} disabled={status === 'loading'}>
        Set Fiat
      </Button>

      {error && <Alert variant={'danger'}>{error.message}</Alert>}
    </FormGroup>
  )
}

const WalletOptions = () => {
  return (
    <Form>
      <RenameWallet />
      <SetFiatCurrencyCode />
    </Form>
  )
}

const DisplayKeys = () => {
  const wallet = useSelectedWallet()

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

const Settings: React.FC = () => {
  return (
    <>
      <WalletOptions />
      <DisplayKeys />
      <Tokens />
    </>
  )
}
