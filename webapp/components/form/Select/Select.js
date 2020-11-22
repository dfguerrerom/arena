/* eslint-disable react/jsx-props-no-spreading */
import './Select.scss'
import React from 'react'
import PropTypes from 'prop-types'
import ReactSelect from 'react-select'

import { defaultComponents, baseStyles, baseTheme } from './config'
import { adaptSelection } from './utils'

export const Select = ({
  customStyle = {},
  className: customClassName,
  components: overrideComponents,
  options,
  value,
  onChange,
  ...props
}) => {
  return (
    <>
      <ReactSelect
        className={customClassName}
        classNamePrefix="select"
        options={options}
        onChange={onChange}
        value={adaptSelection(value)}
        isSearchable
        theme={baseTheme}
        components={{ ...defaultComponents, ...overrideComponents }}
        styles={{ ...baseStyles, ...customStyle }}
        {...props}
      />
    </>
  )
}

Select.propTypes = {
  customStyle: PropTypes.object,
  className: PropTypes.string,
  components: PropTypes.object,
  options: PropTypes.array,
  value: PropTypes.object,
  onChange: PropTypes.func,
}

Select.defaultProps = {
  customStyle: {},
  className: '',
  components: {},
  options: [],
  value: {},
  onChange: null,
}

export default Select
