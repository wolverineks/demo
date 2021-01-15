import * as React from 'react'

export const Debug: React.FC = ({ children }) => (
  <div style={{ borderColor: 'red', borderWidth: 1, borderStyle: 'dashed' }}>{children}</div>
)
