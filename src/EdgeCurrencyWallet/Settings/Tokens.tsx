import { EdgeCurrencyWallet, EdgeMetaToken, EdgeTokenInfo } from 'edge-core-js'
import React from 'react'
import { Accordion, Button, Form, FormControl, FormGroup, FormLabel, ListGroup } from 'react-bootstrap'

import { Boundary, Logo } from '../../components'
import { useCustomTokens, useTokens } from '../../hooks'
import { useFilter } from '../useFilter'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const { enabledTokens, enableToken, disableToken, tokenInfos, customTokenInfos } = useTokens(wallet)
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
  const [visibleTokens, setSearchQuery] = useFilter(matches, [...customTokenInfos.all, ...tokenInfos])

  return (
    <FormGroup>
      <FormLabel>Tokens</FormLabel>
      <Accordion>
        <Accordion.Toggle eventKey={'addToken'}>
          <Button>+</Button>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={'addToken'}>
          <AddToken wallet={wallet} />
        </Accordion.Collapse>
      </Accordion>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
      {visibleTokens.length <= 0 ? (
        <ListGroup.Item>No Tokens Available</ListGroup.Item>
      ) : (
        [...visibleTokens].sort().map((tokenInfo) => (
          <Boundary key={tokenInfo.currencyCode}>
            <TokenRow
              tokenInfo={tokenInfo}
              isEnabled={enabledTokens.includes(tokenInfo.currencyCode)}
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
  onClick: (currencyCode: string) => void
}> = ({ tokenInfo, isEnabled, onClick }) => {
  const { currencyName, displayName } = tokenInfo as any

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Logo currencyCode={tokenInfo.currencyCode} /> {tokenInfo.currencyCode} - {currencyName || displayName}
    </ListGroup.Item>
  )
}

const AddToken = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const [currencyName, setCurrencyName] = React.useState('')
  const [currencyCode, setCurrencyCode] = React.useState('')
  const [contractAddress, setContractAddress] = React.useState('')
  const [multiplier, setMultiplier] = React.useState('')
  const tokenInfo: EdgeTokenInfo = { currencyName, currencyCode, contractAddress, multiplier }

  const { add } = useCustomTokens(wallet)

  const reset = () => {
    setCurrencyCode('')
    setCurrencyCode('')
    setContractAddress('')
    setMultiplier('')
  }

  return (
    <Form>
      <Form.Group>
        <Form.Label>Token Name</Form.Label>
        <FormControl onChange={(event) => setCurrencyName(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Token Code</Form.Label>
        <FormControl onChange={(event) => setCurrencyCode(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Contract Address</Form.Label>
        <FormControl onChange={(event) => setContractAddress(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Multiplier</Form.Label>
        <FormControl onChange={(event) => setMultiplier(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Button onClick={() => add(tokenInfo).then(reset)}>Save</Button>
      </Form.Group>
    </Form>
  )
}
