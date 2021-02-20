import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import {
  Accordion,
  Boundary,
  Button,
  Form,
  FormControl,
  FormGroup,
  FormLabel,
  ListGroup,
  Logo,
  Select,
} from '../../components'
import { useTokens } from '../../hooks'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokens = useTokens(wallet)
  const toggleToken = (currencyCode: string) =>
    tokens.enabled.includes(currencyCode) ? tokens.disable(currencyCode) : tokens.enable(currencyCode)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'enabledOnly' | 'disabledOnly' | 'all'>('all')

  const matches = (tokenInfo: EdgeMetaToken): boolean => {
    const normalize = (text: string) => text.trim().toLowerCase()

    const isEnabled = tokens.enabled.includes(tokenInfo.currencyCode)
    const displayFilter =
      statusFilter === 'enabledOnly' ? isEnabled : statusFilter === 'disabledOnly' ? !isEnabled : true
    const displayMatch =
      normalize(tokenInfo.currencyCode).includes(normalize(searchQuery)) ||
      normalize(tokenInfo.currencyName).includes(normalize(searchQuery)) ||
      normalize(tokenInfo.contractAddress || '').includes(normalize(searchQuery))

    return displayFilter && displayMatch
  }
  const visibleTokens = Object.values(tokens.includedInfos).filter(matches)
  const visibleCustomTokens = Object.values(tokens.customTokenInfos).filter(matches)

  const [addToken, setAddToken] = React.useState<'addToken' | undefined>()
  const [editTokenInfo, setEditTokenInfo] = React.useState<EdgeMetaToken | undefined>()
  const editToken = (tokenInfo: EdgeMetaToken) => {
    setAddToken('addToken')
    setEditTokenInfo(tokenInfo)
  }

  return (
    <FormGroup>
      <FormLabel>Tokens</FormLabel>

      {[...Object.values(tokens.customTokenInfos), ...Object.values(tokens.includedInfos)].length <= 0 ? (
        <ListGroup.Item>No Tokens Available</ListGroup.Item>
      ) : (
        <>
          <Accordion activeKey={addToken}>
            <Accordion.Toggle eventKey={'addToken'}>
              <Button onClick={() => setAddToken(undefined)}>+</Button>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={'addToken'}>
              <AddToken wallet={wallet} tokenInfo={editTokenInfo} onSuccess={() => setAddToken(undefined)} />
            </Accordion.Collapse>
          </Accordion>
          <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
          <Select
            onSelect={(event) => setStatusFilter(event.currentTarget.value)}
            title={'Filter'}
            options={[
              { display: 'All', value: 'all' },
              { display: 'Enabled', value: 'enabledOnly' },
              { display: 'Disabled', value: 'disabledOnly' },
            ]}
            renderOption={(option) => (
              <option key={option.value} value={option.value}>
                {option.display}
              </option>
            )}
          />

          {[...Object.values(visibleCustomTokens), ...Object.values(visibleTokens)].length <= 0 ? (
            <ListGroup.Item>No Matching Tokens</ListGroup.Item>
          ) : (
            <>
              <TokenList
                tokenInfos={visibleCustomTokens}
                renderRow={(tokenInfo: EdgeMetaToken) => (
                  <TokenListRow
                    isEnabled={tokens.enabled.includes(tokenInfo.currencyCode)}
                    tokenInfo={tokenInfo}
                    onEdit={editToken}
                    onToggle={toggleToken}
                    canEdit
                  />
                )}
              />

              <TokenList
                tokenInfos={visibleTokens}
                renderRow={(tokenInfo: EdgeMetaToken) => (
                  <TokenListRow
                    isEnabled={tokens.enabled.includes(tokenInfo.currencyCode)}
                    tokenInfo={tokenInfo}
                    onEdit={editToken}
                    onToggle={toggleToken}
                  />
                )}
              />
            </>
          )}
        </>
      )}
    </FormGroup>
  )
}

const TokenList = ({
  tokenInfos,
  renderRow,
}: {
  tokenInfos: EdgeMetaToken[]
  renderRow: (tokenInfo: EdgeMetaToken) => JSX.Element
}) => (
  <>
    {Object.values(tokenInfos)
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .map(renderRow)}
  </>
)

const TokenListRow = ({
  tokenInfo,
  onEdit,
  onToggle,
  isEnabled,
  canEdit,
}: {
  tokenInfo: EdgeMetaToken
  onEdit: (tokenInfo: EdgeMetaToken) => unknown
  onToggle: (currencyCode: string) => unknown
  isEnabled: boolean
  canEdit?: boolean
}) => {
  return (
    <>
      <Boundary key={tokenInfo.currencyCode} error={{ fallback: null }}>
        <TokenRow canEdit={canEdit} onEdit={onEdit} tokenInfo={tokenInfo} isEnabled={isEnabled} onClick={onToggle} />
      </Boundary>
    </>
  )
}

const TokenRow: React.FC<{
  tokenInfo: EdgeMetaToken
  isEnabled: boolean
  onEdit: (tokenInfo: EdgeMetaToken) => void
  onClick: (currencyCode: string) => void
  canEdit?: boolean
}> = ({ tokenInfo, isEnabled, onClick, onEdit, canEdit }) => {
  const { currencyName, displayName } = tokenInfo as any

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Logo currencyCode={tokenInfo.currencyCode} /> {tokenInfo.currencyCode} - {currencyName || displayName}
      {canEdit ? (
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
