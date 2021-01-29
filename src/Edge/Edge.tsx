import { addEdgeCorePlugins, closeEdge, lockEdgeCorePlugins } from 'edge-core-js'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { plugins } from './plugins'
import { useEdgeContext } from './useEdgeContext'

export const queryClientOptions = {
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
    mutations: {
      useErrorBoundary: false,
    },
  },
}

export const useEdge = () => {
  useEdgeContext()

  React.useEffect(() => {
    plugins.forEach(addEdgeCorePlugins)
    lockEdgeCorePlugins()

    return () => {
      closeEdge()
    }
  }, [])
}

export const WithEdge = () => {
  useEdge()

  return null
}

const isTesting = process.env.NODE_ENV === 'test'

export const Edge: React.FC = ({ children }) => {
  return (
    <EdgeCache>
      {!isTesting && <ReactQueryDevtools />}
      <WithEdge />
      {children}
    </EdgeCache>
  )
}

const queryClient = new QueryClient(queryClientOptions)
export const EdgeCache: React.FC = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
