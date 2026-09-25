import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../auth'
import { Alert, Button, Debug, FlipInput, Form, FormControl, FormGroup, FormLabel, InputGroup } from '../components'
import {
  getCurrencyCodeFromTokenId,
  useCryptoDisplayDenomination,
  useFiatCurrencyCode,
  useReceiveAddressAndEncodeUri,
} from '../hooks'

const QRCode = React.lazy(() => import('react-qr-code'))

export const Request: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const account = useEdgeAccount()
  const [nativeAmount, setNativeAmount] = React.useState('0')
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)
  const [displayDenomination] = useCryptoDisplayDenomination(account, wallet.currencyInfo.pluginId, tokenId)
  const { data, error } = useReceiveAddressAndEncodeUri({ wallet, nativeAmount, options: { tokenId } })
  const currencyCode = getCurrencyCodeFromTokenId(account, wallet.currencyInfo.pluginId, tokenId)

  return (
    <Form>
      <FormGroup>
        <FormLabel>Public Address:</FormLabel>
        <InputGroup>
          <FormControl value={data?.publicAddress || ''} readOnly />
          <InputGroup.Append>
            <Button
              variant="outline-secondary"
              onClick={() => navigator.clipboard.writeText(data?.publicAddress || '')}
            >
              Copy
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </FormGroup>

      <FormGroup>
        <FlipInput onChange={setNativeAmount} wallet={wallet} tokenId={tokenId} fiatCurrencyCode={fiatCurrencyCode} />
      </FormGroup>

      <FormGroup>
        <React.Suspense fallback={<div className="empty-state">Preparing QR…</div>}>
          {data?.uri ? <QRCode value={data.uri} /> : null}
        </React.Suspense>
      </FormGroup>

      <FormGroup>
        <FormLabel>URI</FormLabel>
        <InputGroup>
          <FormControl value={data?.uri || ''} readOnly />
          <InputGroup.Append>
            <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(data?.uri || '')}>
              Copy
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </FormGroup>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      <Debug>
        <JSONPretty
          data={{
            nativeAmount,
            fiatCurrencyCode,
            displayDenomination,
            tokenId,
            currencyCode,
            uri: data?.uri,
            publicAddress: data?.publicAddress,
            addresses: data?.addresses,
          }}
        />
      </Debug>
    </Form>
  )
}
