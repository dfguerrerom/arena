import React from 'react'
import PropTypes from 'prop-types'

import * as A from '@core/arena'
import * as Survey from '@core/survey/survey'
import * as Category from '@core/survey/category'

import ErrorBadge from '@webapp/components/errorBadge'
import WarningBadge from '@webapp/components/warningBadge'

import { useSurvey } from '@webapp/store/survey'
import { useI18n } from '@webapp/store/system'
import { useAuthCanEditSurvey } from '@webapp/store/user'

import { State as ListState, useActions as useListActions } from '../store'

const TableRow = (props) => {
  const { idx, initData, listState, setListState, offset, row: category } = props

  const survey = useSurvey()
  const unused = A.isEmpty(Survey.getNodeDefsByCategoryUuid(Category.getUuid(category))(survey))
  const position = idx + offset + 1

  const i18n = useI18n()

  const canEdit = useAuthCanEditSurvey()

  const ListActions = useListActions({ setState: setListState })

  const canSelect = ListState.getCanSelect(listState)
  const selectedItemUuid = ListState.getSelectedItemUuid(listState)
  const selected = selectedItemUuid && selectedItemUuid === Category.getUuid(category)

  return (
    <>
      <div>{position}</div>
      <div>{Category.getName(category)}</div>
      {canEdit && (
        <>
          <div>
            <ErrorBadge validation={Category.getValidation(category)} />
          </div>
          <div>
            <WarningBadge show={unused} label={i18n.t('itemsTable.unused')} />
          </div>
        </>
      )}
      {canSelect && (
        <div>
          <button
            type="button"
            className={`btn btn-s${selected ? ' active' : ''}`}
            onClick={() => ListActions.select({ category })}
          >
            <span className={`icon icon-checkbox-${selected ? '' : 'un'}checked icon-12px icon-left`} />
            {i18n.t(selected ? 'common.selected' : 'common.select')}
          </button>
        </div>
      )}
      {canEdit && (
        <>
          <div>
            <button type="button" className="btn btn-s" onClick={() => ListActions.edit({ category })}>
              <span className="icon icon-pencil2 icon-12px icon-left" />
              {i18n.t('common.edit')}
            </button>
          </div>
          <div>
            <button type="button" className="btn btn-s" onClick={() => ListActions.delete({ category, initData })}>
              <span className="icon icon-bin2 icon-12px icon-left" />
              {i18n.t('common.delete')}
            </button>
          </div>
        </>
      )}
    </>
  )
}

TableRow.propTypes = {
  idx: PropTypes.number.isRequired,
  initData: PropTypes.func.isRequired,
  listState: PropTypes.object.isRequired,
  offset: PropTypes.number.isRequired,
  row: PropTypes.object.isRequired,
  setListState: PropTypes.func.isRequired,
}

export default TableRow
