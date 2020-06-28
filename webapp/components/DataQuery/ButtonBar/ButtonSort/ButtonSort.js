import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { Query, Sort, SortCriteria } from '@common/model/query'

import { useI18n } from '@webapp/store/system'

import Tooltip from '@webapp/components/tooltip'

import SortEditor from './SortEditor'

const ButtonSort = (props) => {
  const { disabled, query, onChangeQuery } = props
  const sort = Query.getSort(query)

  const i18n = useI18n()

  const [showSortEditor, setShowSortEditor] = useState(false)
  const toggleSortEditor = () => setShowSortEditor(!showSortEditor)

  const tooltipMessages = sort.map(
    (sortCriteria) =>
      `${SortCriteria.getLabel(sortCriteria)} (${i18n.t(`common.${SortCriteria.getOrder(sortCriteria)}ending`)})`
  )

  return (
    <>
      <Tooltip messages={tooltipMessages}>
        <button
          type="button"
          className={classNames('btn', 'btn-s', 'btn-edit', { highlight: !Sort.isEmpty(sort) })}
          onClick={toggleSortEditor}
          aria-disabled={disabled}
        >
          <span className="icon icon-sort-amount-asc icon-14px" />
        </button>
      </Tooltip>

      {showSortEditor && (
        <SortEditor
          query={query}
          onChange={(sortUpdated) => {
            onChangeQuery(Query.assocSort(sortUpdated))
            toggleSortEditor()
          }}
          onClose={toggleSortEditor}
        />
      )}
    </>
  )
}

ButtonSort.propTypes = {
  disabled: PropTypes.bool.isRequired,
  query: PropTypes.object.isRequired,
  onChangeQuery: PropTypes.func.isRequired,
}

export default ButtonSort
