import * as R from 'ramda'

import {
  getNodeDefByUUID,
} from '../../common/survey/survey'

const survey = 'survey'

/**
 * ======================
 * Survey State
 * ======================
 */

// READ
export const getSurvey = R.prop(survey)

export const getSurveyId = R.pipe(
  getSurvey,
  R.prop('id'),
)

export const getNewSurvey = R.pipe(
  R.path([survey, 'newSurvey']),
  R.defaultTo({name: '', label: '', lang: 'en', validation: {}})
)

/**
 * ======================
 * Survey-Form State
 * ======================
 */
// CURRENT VIEW NODE_DEF PAGE
const nodeDefViewPage = ['form', 'nodeDefViewPage']
export const assocFormNodeDefViewPage = nodeDef =>
  R.assocPath(nodeDefViewPage, nodeDef ? nodeDef.uuid : null)

export const getFormNodeDefViewPage = state => {
  const surveyState = getSurvey(state)
  const uuid = R.path(nodeDefViewPage, surveyState)
  return getNodeDefByUUID(uuid)(surveyState)
}

// CURRENT EDITING NODE_DEF
const nodeDefEditPath = ['form', 'nodeDefEdit']
export const assocFormNodeDefEdit = nodeDef =>
  R.assocPath(nodeDefEditPath, nodeDef ? nodeDef.uuid : null)

export const getFormNodeDefEdit = state => {
  const surveyState = getSurvey(state)
  const uuid = R.path(nodeDefEditPath, surveyState)
  return getNodeDefByUUID(uuid)(surveyState)
}

// CURRENT UNLOCKED NODE_DEF ENTITY
const nodeDefEntityUnlockedPath = ['form', 'nodeDefUnlocked']
export const assocNodeDefFormUnlocked = nodeDef =>
  R.assocPath(nodeDefEntityUnlockedPath, nodeDef ? nodeDef.uuid : null)

export const getNodeDefFormUnlocked = state => {
  const surveyState = getSurvey(state)
  const uuid = R.path(nodeDefEntityUnlockedPath, surveyState)
  return getNodeDefByUUID(uuid)(surveyState)
}

export const isNodeDefFormLocked = nodeDef => R.pipe(
  getSurvey,
  R.path(nodeDefEntityUnlockedPath),
  R.equals(nodeDef.uuid),
  R.not,
)
