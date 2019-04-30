import axios from 'axios'

import { toUuidIndexedObj } from '../../../../common/survey/surveyUtils'
import { getStateSurveyId } from '../../../survey/surveyState'

import Category from '../../../../common/survey/category'
import CategoryLevel from '../../../../common/survey/categoryLevel'
import CategoryItem from '../../../../common/survey/categoryItem'

import { debounceAction } from '../../../utils/reduxUtils'
import {
  categoryCreate,
  categoryDelete,
  categoryItemCreate,
  categoryItemDelete,
  categoryItemPropUpdate,
  categoryItemsUpdate,
  categoryItemUpdate,
  categoryLevelDelete,
  categoryLevelPropUpdate,
  categoryPropUpdate,
  categoryUpdate,
  categoriesUpdate,
} from '../../../survey/categories/actions'

export const categoryEditUpdate = 'surveyForm/categoryEdit/update'
export const categoryEditLevelActiveItemUpdate = 'surveyForm/categoryEdit/levelActiveItem/update'

export const dispatchCategoryUpdate = (dispatch, category) =>
  dispatch({ type: categoryUpdate, category })

//======
//====== SET FOR EDIT
//======

export const setCategoryForEdit = (category) => async (dispatch) => {
  const categoryUuid = Category.getUuid(category)
  dispatch({ type: categoryEditUpdate, categoryUuid })

  //load first level items
  if (category)
    dispatch(loadLevelItems(categoryUuid))
}

export const setCategoryItemForEdit = (category, level, item, edit = true) => async (dispatch) => {
  const itemUuid = edit ? CategoryItem.getUuid(item) : null
  const levelIndex = CategoryLevel.getIndex(level)
  dispatch({ type: categoryEditLevelActiveItemUpdate, levelIndex, itemUuid })

  //load child items
  dispatch(loadLevelItems(Category.getUuid(category), levelIndex + 1, itemUuid))
}

//======
//====== CREATE
//======

export const createCategory = () => async (dispatch, getState) => {
  const surveyId = getStateSurveyId(getState())
  const { data } = await axios.post(`/api/survey/${surveyId}/categories`, Category.newCategory())

  const category = data.category

  dispatch({ type: categoryCreate, category })

  return category
}

export const createCategoryLevel = (category) => async (dispatch, getState) => {
  const level = Category.newLevel(category)
  const surveyId = getStateSurveyId(getState())

  const { data } = await axios.post(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}/levels`, level)
  dispatchCategoryUpdate(dispatch, data.category)
}

export const createCategoryLevelItem = (category, level, parentItem) => async (dispatch, getState) => {
  const item = CategoryItem.newItem(CategoryLevel.getUuid(level), parentItem)
  dispatch({ type: categoryItemCreate, level, item })

  const surveyId = getStateSurveyId(getState())
  const { data } = await axios.post(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}/items`, item)

  dispatchCategoryUpdate(dispatch, data.category)
  dispatch({ type: categoryItemUpdate, level, item: data.item })
}

//======
//====== READ
//======

// load items for specified level
const loadLevelItems = (categoryUuid, levelIndex = 0, parentUuid = null) =>
  async (dispatch, getState) => {
    //reset level items first
    dispatch({ type: categoryItemsUpdate, levelIndex, items: null })

    const surveyId = getStateSurveyId(getState())
    const { data } = await axios.get(
      `/api/survey/${surveyId}/categories/${categoryUuid}/items`,
      { params: { draft: true, parentUuid } }
    )
    const items = toUuidIndexedObj(data.items)
    dispatch({ type: categoryItemsUpdate, levelIndex, items })
  }

//======
//====== UPDATE
//======

export const putCategoryProp = (category, key, value) => async (dispatch, getState) => {
  dispatch({ type: categoryPropUpdate, category, key, value })

  const action = async () => {
    const surveyId = getStateSurveyId(getState())
    const { data } = await axios.put(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}`, { key, value })
    dispatch({ type: categoriesUpdate, categories: data.categories })
  }

  dispatch(debounceAction(action, `${categoryPropUpdate}_${Category.getUuid(category)}`))
}

export const putCategoryLevelProp = (category, level, key, value) => async (dispatch, getState) => {
  dispatch({ type: categoryLevelPropUpdate, category, level, key, value })

  const levelUuid = CategoryLevel.getUuid(level)

  const action = async () => {
    const surveyId = getStateSurveyId(getState())
    const { data } = await axios.put(
      `/api/survey/${surveyId}/categories/${Category.getUuid(category)}/levels/${levelUuid}`,
      { key, value }
    )
    dispatchCategoryUpdate(dispatch, data.category)
  }

  dispatch(debounceAction(action, `${categoryLevelPropUpdate}_${levelUuid}`))
}

export const putCategoryItemProp = (category, level, item, key, value) => async (dispatch, getState) => {
  dispatch({ type: categoryItemPropUpdate, category, level, item, key, value })

  const itemUuid = CategoryItem.getUuid(item)

  const action = async () => {
    const surveyId = getStateSurveyId(getState())
    const { data } = await axios.put(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}/items/${itemUuid}`, {
      key,
      value
    })
    dispatchCategoryUpdate(dispatch, data.category)
  }

  dispatch(debounceAction(action, `${categoryItemPropUpdate}_${itemUuid}`))
}

//======
//====== DELETE
//======

export const deleteCategory = category => async (dispatch, getState) => {
  dispatch({ type: categoryDelete, category })

  const surveyId = getStateSurveyId(getState())
  const { data } = await axios.delete(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}`)
  dispatch({ type: categoriesUpdate, categories: data.categories })
}

export const deleteCategoryLevel = (category, level) => async (dispatch, getState) => {
  dispatch({ type: categoryLevelDelete, category, level })

  //delete level and items from db
  const surveyId = getStateSurveyId(getState())
  const { data } = await axios.delete(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}/levels/${CategoryLevel.getUuid(level)}`)
  dispatchCategoryUpdate(dispatch, data.category)
}

export const deleteCategoryItem = (category, level, item) => async (dispatch, getState) => {
  dispatch({ type: categoryItemDelete, item, level })

  const surveyId = getStateSurveyId(getState())
  const { data } = await axios.delete(`/api/survey/${surveyId}/categories/${Category.getUuid(category)}/items/${CategoryItem.getUuid(item)}`)
  dispatchCategoryUpdate(dispatch, data.category)
}