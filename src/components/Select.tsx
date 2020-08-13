import React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap'

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
  options: T[]
  renderOption: (item: T) => React.ReactElement
  onSelect: (event: React.ChangeEvent<any>) => any
  disabled?: boolean
  title: string
  id?: string
  defaultValue?: string
  value?: string
}) => {
  return (
    <FormGroup>
      <FormLabel>{title}</FormLabel>
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
