import { render, screen } from '@testing-library/react'
import { EdgeAccount, closeEdge } from 'edge-core-js'
import React from 'react'

import { EdgeAccountContext } from '../../auth'
import { fakeUser } from '../../hooks/tests/fake-user'
import { makeFakeEdgeContext } from '../../hooks/tests/utils'
import { Logo } from '../Logo'

const AccountHarness: React.FC<{ account: EdgeAccount }> = ({ account, children }) => (
  <EdgeAccountContext.Provider value={account}>{children}</EdgeAccountContext.Provider>
)

describe('Logo', () => {
  afterAll(closeEdge)

  it('derives the parent currency code from the plugin id', async () => {
    const context = await makeFakeEdgeContext({ ethereum: true })
    const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

    render(
      <AccountHarness account={account}>
        <Logo pluginId="ethereum" />
      </AccountHarness>,
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'ETH')
    expect(img.getAttribute('src')).toContain('/ethereum/ethereum.png')
  })

  it('derives a token currency code from the plugin id and token id', async () => {
    const context = await makeFakeEdgeContext({ ethereum: true })
    const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)
    const tokenId = 'dac17f958d2ee523a2206206994597c13d831ec7'

    render(
      <AccountHarness account={account}>
        <Logo pluginId="ethereum" tokenId={tokenId} />
      </AccountHarness>,
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'USDT')
    expect(img.getAttribute('src')).toContain(`/ethereum/${tokenId}.png`)
  })

})
