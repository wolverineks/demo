import { addEdgeCorePlugins, closeEdge, lockEdgeCorePlugins } from 'edge-core-js'
import React from 'react'
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query'
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
  const queryClient = useQueryClient()
  useEdge()

  React.useEffect(() => queryClient.clear(), [queryClient])

  return null
}

export const Edge: React.FC = ({ children }) => {
  return (
    <EdgeCache>
      <ReactQueryDevtools />
      <WithEdge />
      {children}
    </EdgeCache>
  )
}

const queryClient = new QueryClient(queryClientOptions)
export const EdgeCache: React.FC = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
