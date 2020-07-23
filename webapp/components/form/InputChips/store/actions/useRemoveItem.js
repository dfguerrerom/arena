import { useCallback } from 'react'

import * as R from 'ramda'

export const useRemoveItem = ({ onChange, onItemRemove }) =>
  useCallback(
    ({ selection }) => (item) => {
      if (onChange) {
        const idx = R.indexOf(item)(selection)
        const newItems = R.remove(idx, 1, selection)
        onChange(newItems)
      }
      if (onItemRemove) {
        onItemRemove(item)
      }
    },
    []
  )
