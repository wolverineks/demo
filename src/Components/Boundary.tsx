import React from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

const defaultSuspense = { fallback: <div>Loading...</div> }

const fallbackRender = ({ error }: FallbackProps) => <div>Error: {error?.message}</div>
const defaultError = { fallbackRender }

export const Boundary: React.FC<{
  suspense?: Partial<React.ComponentProps<typeof React.Suspense>>
  error?: Partial<React.ComponentProps<typeof ErrorBoundary>>
}> = ({ error = {}, suspense = {}, children }) => (
  <React.Suspense {...defaultSuspense} {...suspense}>
    <ErrorBoundary {...defaultError} {...error}>
      {children}
    </ErrorBoundary>
  </React.Suspense>
)
