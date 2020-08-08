import { addEdgeCorePlugins, closeEdge, lockEdgeCorePlugins } from 'edge-core-js'
import React from 'react'
import { ReactQueryConfigProvider } from 'react-query'

import { plugins } from './plugins'
import { useEdgeContext } from './useEdgeContext'

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

export const Edge: React.FC = ({ children }) => {
  useEdge()

  return (
    <ReactQueryConfigProvider
      config={{
        queries: {
          cacheTime: Infinity,
          staleTime: Infinity,
          retry: false,
          suspense: true,
        },
        mutations: {
          useErrorBoundary: false,
          throwOnError: false,
        },
        shared: {},
      }}
    >
      {children}
    </ReactQueryConfigProvider>
  )
}
