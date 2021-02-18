import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { Accordion, Button, Form, FormControl, FormGroup, FormLabel, ListGroup } from 'react-bootstrap'

import { Boundary, Logo } from '../../components'
import { useTokens } from '../../hooks'
import { useFilter } from '../useFilter'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokens = useTokens(wallet)
  const toggleToken = React.useCallback(
    (currencyCode: string) =>
      tokens.enabled.includes(currencyCode) ? tokens.disable(currencyCode) : tokens.enable(currencyCode),
    [tokens],
  )

  const matches = (query: string) => (token: EdgeMetaToken): boolean => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return (
      normalize(token.currencyCode).includes(normalize(query)) ||
      normalize(token.currencyName).includes(normalize(query)) ||
      normalize(token.contractAddress || '').includes(normalize(query))
    )
  }
  const [visibleTokens, setSearchQuery] = useFilter(matches, [
    ...Object.values(tokens.customTokenInfos),
    ...Object.values(tokens.includedInfos),
  ])

  const [addToken, setAddToken] = React.useState<'addToken' | undefined>()
  const [editTokenInfo, setEditTokenInfo] = React.useState<EdgeMetaToken | undefined>()

  return (
    <FormGroup>
      <FormLabel>Tokens</FormLabel>
      <Accordion activeKey={addToken}>
        <Accordion.Toggle eventKey={'addToken'}>
          <Button onClick={() => setAddToken(undefined)}>+</Button>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={'addToken'}>
          <AddToken wallet={wallet} tokenInfo={editTokenInfo} onSuccess={() => setAddToken(undefined)} />
        </Accordion.Collapse>
      </Accordion>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
      {visibleTokens.length <= 0 ? (
        <ListGroup.Item>No Tokens Available</ListGroup.Item>
      ) : (
        visibleTokens.sort().map((tokenInfo) => (
          <Boundary
            key={tokenInfo.currencyCode}
            error={{
              fallback: (
                <div>
                  <Button onClick={() => wallet.disableTokens([tokenInfo.currencyCode])}>Disable</Button>
                </div>
              ),
            }}
          >
            <TokenRow
              onEdit={(tokenInfo) => {
                setAddToken('addToken')
                setEditTokenInfo(tokenInfo)
              }}
              tokenInfo={tokenInfo}
              isEnabled={tokens.enabled.includes(tokenInfo.currencyCode)}
              onClick={toggleToken}
            />
          </Boundary>
        ))
      )}
    </FormGroup>
  )
}

const TokenRow: React.FC<{
  tokenInfo: EdgeMetaToken
  isEnabled: boolean
  onEdit: (tokenInfo: EdgeMetaToken) => void
  onClick: (currencyCode: string) => void
}> = ({ tokenInfo, isEnabled, onClick, onEdit }) => {
  const { currencyName, displayName } = tokenInfo as any
  const isCustomToken = true

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Logo currencyCode={tokenInfo.currencyCode} /> {tokenInfo.currencyCode} - {currencyName || displayName}
      {isCustomToken ? (
        <Button
          onClick={(event) => {
            event.stopPropagation()
            onEdit(tokenInfo)
          }}
        >
          EDIT
        </Button>
      ) : null}
    </ListGroup.Item>
  )
}

const AddToken = ({
  wallet,
  tokenInfo,
  onSuccess,
}: {
  wallet: EdgeCurrencyWallet
  tokenInfo?: EdgeMetaToken
  onSuccess: () => void
}) => {
  const [currencyName, setCurrencyName] = React.useState(tokenInfo?.currencyName || '')
  const [currencyCode, setCurrencyCode] = React.useState(tokenInfo?.currencyCode || '')
  const [contractAddress, setContractAddress] = React.useState(tokenInfo?.contractAddress || '')
  const [multiplier, setMultiplier] = React.useState(tokenInfo?.denominations[0].multiplier || '')

  const { addCustomInfo } = useTokens(wallet)

  const reset = () => {
    setCurrencyName('')
    setCurrencyCode('')
    setCurrencyCode('')
    setContractAddress('')
    setMultiplier('')
  }

  React.useEffect(() => {
    if (!tokenInfo) return

    setCurrencyName(tokenInfo?.currencyName || '')
    setCurrencyCode(tokenInfo?.currencyCode || '')
    setContractAddress(tokenInfo?.contractAddress || '')
    setMultiplier(tokenInfo?.denominations[0].multiplier || '')
  }, [tokenInfo])

  return (
    <Form>
      <Form.Group>
        <Form.Label>Token Name</Form.Label>
        <FormControl value={currencyName} onChange={(event) => setCurrencyName(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Token Code</Form.Label>
        <FormControl
          disabled={!!tokenInfo?.currencyCode}
          value={currencyCode}
          onChange={(event) => setCurrencyCode(event.currentTarget.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Contract Address</Form.Label>
        <FormControl value={contractAddress} onChange={(event) => setContractAddress(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Multiplier</Form.Label>
        <FormControl value={multiplier} onChange={(event) => setMultiplier(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Button
          onClick={() =>
            addCustomInfo({ currencyName, currencyCode, contractAddress, multiplier }).then(() => {
              onSuccess()
              setTimeout(reset, 1000)
            })
          }
        >
          Save
        </Button>
      </Form.Group>
    </Form>
  )
}
