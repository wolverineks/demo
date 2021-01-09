import { addEdgeCorePlugins, closeEdge, lockEdgeCorePlugins } from 'edge-core-js'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { plugins } from './plugins'
import { useEdgeContext } from './useEdgeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
      retry: false,
      suspense: true,
    },
    mutations: {
      useErrorBoundary: false,
    },
  },
})

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

const WithEdge = () => {
  useEdge()

  return null
}

export const Edge: React.FC = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <WithEdge />
      {children}
    </QueryClientProvider>
  )
}
