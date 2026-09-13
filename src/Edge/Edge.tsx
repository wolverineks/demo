import { addEdgeCorePlugins, closeEdge, lockEdgeCorePlugins } from 'edge-core-js'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { plugins } from './plugins'
import { useEdgeContext } from './useEdgeContext'

export const Edge: React.FC = ({ children }) => {
  return (
    <EdgeCache>
      <ReactQueryDevtools initialIsOpen={false} />
      <UseEdge />
      {children}
    </EdgeCache>
  )
}

const queryClientOptions = {
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

const queryClient = new QueryClient(queryClientOptions)
export const EdgeCache: React.FC = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

export const UseEdge = () => {
  useEdge()

  return null
}
