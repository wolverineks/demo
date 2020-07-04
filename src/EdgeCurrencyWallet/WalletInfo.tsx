import { EdgeAccount, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import {
  useDisableTokens,
  useEnableTokens,
  useOnNewTransactions,
  useRenameWallet,
  useSetFiatCurrencyCode,
  useWatchAll,
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
import { useQuery } from 'react-query'

import { fiatInfos } from '../Fiat'
import { Disklet } from '../Storage/Disklet'
import { BalanceList } from './BalanceList'
import { Request } from './Request'
import { Send } from './Send'
import { TransactionList } from './TransactionList'

export const WalletInfo: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}> = ({ account, wallet }) => {
  useWatchAll(wallet)
  useWatchAll(account)
  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  return (
    <Tabs variant={'pills'} id={'walletTabs'} defaultActiveKey={'balance'}>
      <Tab eventKey={'balance'} title={'Balance'}>
        <BalanceList wallet={wallet} account={account} />
        <TransactionList key={wallet.id} account={account} wallet={wallet} />
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Send wallet={wallet} />
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Request account={account} wallet={wallet} />
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

const useEnabledTokens = ({ wallet }: { wallet: EdgeCurrencyWallet }) =>
  useQuery({
    queryKey: ['enabledTokens', wallet.id],
    queryFn: () => wallet.getEnabledTokens(),
    config: { suspense: true },
  }).data!

const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWatchAll(wallet)

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

const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWatchAll(wallet)
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

const SetFiatCurrencyCode: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWatchAll(wallet)
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

const WalletOptions = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  return (
    <Form>
      <RenameWallet wallet={wallet} />
      <SetFiatCurrencyCode wallet={wallet} />
    </Form>
  )
}

const DisplayKeys = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  useWatchAll(wallet)

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
