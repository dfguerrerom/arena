import * as R from 'ramda'

import {
  getCodeLists as getSurveyCodeLists,
  getCodeListByUUID,
} from '../../../common/survey/survey'

// DOCS
const surveyState = {
  survey: {
    //....
    codeLists: {
      uuid: {
        // codelist
        uuid: '',
        props: {},
        levels: {
          0: {
            uuid: '',
            props: {},
          },
        }
      }
    },
    // loaded codeList
    codeListEdit: {
      uuid: '',
      levelItems: {
        0: {'itemUUID': {}},
        1: {'itemUUID': {}},
      },
      activeLevelItem: {
        0: 'uuid',
        1: 'uuid',
      }
    },

  }
}

const codeListEdit = 'codeListEdit'

const codeListEditPath = [codeListEdit]
const activeLevelItemPath = R.concat(codeListEditPath, ['activeLevelItem'])
const levelItemsPath = R.append('levelItems', codeListEditPath)

export const getCodeLists = R.pipe(
  getSurveyCodeLists,
  R.dissoc(codeListEdit)
)

// ==== current editing codeList

export const updateCodeListEdit = (codeListUUID = null) =>
  codeListUUID
    ? R.assocPath(['codeLists', codeListEdit, 'uuid'], codeListUUID)
    : R.dissocPath(['codeLists', codeListEdit])

export const getCodeListEditCodeList = survey => R.pipe(
  getSurveyCodeLists,
  R.path([codeListEdit, 'uuid']),
  codeListUUUID => getCodeListByUUID(codeListUUUID)(survey),
)(survey)

const getActiveLevelItem = R.pipe(
  R.path(activeLevelItemPath),
  R.defaultTo({}),
)

const getActiveLevelItemUUID = levelIndex => R.pipe(
  getActiveLevelItem,
  R.prop(levelIndex),
)

export const getCodeListEditActiveLevelItem = levelIndex => state => R.pipe(
  getActiveLevelItemUUID(levelIndex),
  activeItemUUID => R.find(item => item.uuid === activeItemUUID, getCodeListEditLevelItemsArray(levelIndex)(state))
)(state)

export const getCodeListEditLevelItems = levelIndex => R.pipe(
  R.path(levelItemsPath),
  R.prop(levelIndex),
  R.defaultTo({}),
)

export const getCodeListEditLevelItemsArray = levelIndex => R.pipe(
  getCodeListEditLevelItems(levelIndex),
  R.values,
  R.sort((a, b) => Number(a.id) - Number(b.id)),
)

export const getCodeListEditLevelItemByUUID = (levelIndex, itemUUID) => R.path(R.concat(levelItemsPath, [levelIndex, itemUUID]))

export const getCodeListEditActiveItemAndAncestorsUUIDs = levelIndex => state => R.pipe(
  getActiveLevelItem,
  R.keys,
  R.filter(index => index <= levelIndex),
  R.sort((a, b) => Number(a.id) - Number(b.id)),
  R.reduce((acc, prevLevelIndex) => R.append(getActiveLevelItemUUID(prevLevelIndex)(state), acc), []),
)(state)

// ========== UPDATE

export const assocCodeListEditLevelItems = (levelIndex, items) =>
  state => R.pipe(
    R.path(R.append(levelIndex, levelItemsPath)),
    oldItems => R.merge(oldItems, items),
    //remove deleted items (null value)
    updatedItems => R.reduce((acc, itemUUID) => R.prop(itemUUID)(acc) === null ? R.dissoc(itemUUID)(acc) : acc, updatedItems, R.keys(updatedItems)),
    updatedItems => R.assocPath(R.append(levelIndex, levelItemsPath), updatedItems)(state),
  )(state)

export const dissocCodeListEditLevelItems = (levelIndex) => R.dissocPath(R.append(levelIndex, levelItemsPath))

export const assocCodeListEditActiveLevelItem = (levelIndex, itemUUID) => state => R.pipe(
  dissocCodeListEditActiveLevelItem(levelIndex),
  getActiveLevelItem,
  R.assoc(levelIndex, itemUUID),
  updatedActiveItems => R.assocPath(activeLevelItemPath, updatedActiveItems)(state)
)(state)

export const dissocCodeListEditActiveLevelItem = (levelIndex) => state => R.pipe(
  getActiveLevelItem,
  //remove items in following levels
  activeItems => R.reduce((acc, index) =>
      R.assoc(index, R.prop(index)(activeItems), acc)
    , {})
  (R.filter(index => index < levelIndex)(R.keys(activeItems))), //consider only previous levels items
  updatedActiveItems => R.assocPath(activeLevelItemPath, updatedActiveItems)(state),

  dissocLevelItems(levelIndex + 1),
)(state)

const dissocLevelItems = levelIndex => state => R.pipe(
  R.path(levelItemsPath),
  //remove items in following levels
  itemsByLevel => R.reduce((acc, index) =>
      R.assoc(index, R.prop(index)(itemsByLevel), acc)
    , {})
  (R.filter(index => index < levelIndex)(R.keys(itemsByLevel))), //consider only previous levels items
  updatedItemsByLevel => R.assocPath(levelItemsPath, updatedItemsByLevel)(state)
)(state)

