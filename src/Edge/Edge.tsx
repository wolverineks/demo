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
          useErrorBoundary: true,
          cacheTime: 0,
          staleTime: Infinity,
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: { useErrorBoundary: false },
      }}
    >
      {children}
    </ReactQueryConfigProvider>
  )
}

// close: void;
//     error: Error;
//     login: EdgeAccount;
//     loginStart: {
//         username: string;
//     };
//     loginError: {
//         error: Error;
//     };

// useOn(useEdgeContext(), "error", error => alert(error));
// const useOn = (
//   object: any,
//   eventName: string,
//   callback: (error: Error) => any,
// ) => {
//   React.useEffect(() => {
//     const unsub = object.on(eventName, callback);

//     return () => {
//       unsub();
//     };
//   }, [object, eventName, callback]);
// };
