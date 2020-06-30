import './CategorySelector.scss'

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import * as Survey from '@core/survey/survey'
import * as Category from '@core/survey/category'

import { useI18n } from '@webapp/store/system'
import Dropdown from '@webapp/components/form/dropdown'
import PanelRight from '@webapp/components/PanelRight'

import CategoriesView from '@webapp/loggedin/surveyViews/categories/categoriesView'

import { useSurvey } from '@webapp/store/survey'

import * as CategoryActions from '@webapp/loggedin/surveyViews/category/actions'

const CategorySelector = (props) => {
  const { disabled, categoryUuid, validation, showManage, showAdd, onChange } = props

  const i18n = useI18n()

  const dispatch = useDispatch()

  const [showCategoriesPanel, setShowCategoriesPanel] = useState(false)

  const survey = useSurvey()
  const categories = Survey.getCategoriesArray(survey)
  const category = Survey.getCategoryByUuid(categoryUuid)(survey)

  return (
    <div className="category-selector">
      <Dropdown
        disabled={disabled}
        items={categories}
        itemKeyProp={Category.keys.uuid}
        itemLabelFunction={Category.getName}
        validation={validation}
        selection={category}
        onChange={onChange}
      />
      {showAdd && (
        <button
          type="button"
          className="btn btn-s"
          style={{ justifySelf: 'center' }}
          onClick={async () => {
            const newCategory = await dispatch(CategoryActions.createCategory())
            onChange(newCategory)
            setShowCategoriesPanel(true)
          }}
          aria-disabled={disabled}
        >
          <span className="icon icon-plus icon-12px icon-left" />
          {i18n.t('common.add')}
        </button>
      )}
      {showManage && (
        <button
          type="button"
          className="btn btn-s"
          style={{ justifySelf: 'center' }}
          onClick={() => setShowCategoriesPanel(true)}
        >
          <span className="icon icon-list icon-12px icon-left" />
          {i18n.t('common.manage')}
        </button>
      )}
      {showCategoriesPanel && (
        <PanelRight width="90vw" onClose={() => setShowCategoriesPanel(false)} header={i18n.t('appModules.categories')}>
          <CategoriesView canSelect selectedItemUuid={categoryUuid} onSelect={onChange} />
        </PanelRight>
      )}
    </div>
  )
}

CategorySelector.propTypes = {
  categoryUuid: PropTypes.string,
  validation: PropTypes.object,
  disabled: PropTypes.bool,
  showManage: PropTypes.bool,
  showAdd: PropTypes.bool,
  onChange: PropTypes.func,
}

CategorySelector.defaultProps = {
  categoryUuid: null, // Selected categoryUuid
  validation: null,
  disabled: false,
  showManage: true,
  showAdd: true,
  onChange: () => ({}),
}

export default CategorySelector
