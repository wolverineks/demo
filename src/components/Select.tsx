import React from 'react'

import { FormControl, FormGroup, FormLabel } from '../components'

export const Select = <T,>({
  options,
  renderOption,
  onSelect,
  disabled,
  title,
  id,
  defaultValue,
  value,
}: {
  options: ReadonlyArray<T>
  renderOption: (item: T) => React.ReactElement
  onSelect: React.ChangeEventHandler<HTMLSelectElement & T>
  disabled?: boolean
  title?: string
  id?: string
  defaultValue?: string
  value?: string
}) => {
  return (
    <FormGroup>
      {title && <FormLabel>{title}</FormLabel>}
      <FormControl
        as="select"
        id={id || title}
        disabled={disabled}
        onChange={onSelect}
        defaultValue={defaultValue}
        value={value}
      >
        {options.map(renderOption)}
      </FormControl>
    </FormGroup>
  )
}
