import { useSelector } from 'react-redux'

import * as Survey from '@core/survey/survey'
import * as NodeDef from '@core/survey/nodeDef'

import { useLang } from '@webapp/store/system'
import { SurveyFormState } from '@webapp/store/ui'

import { useOnUpdate } from '@webapp/components/hooks'

import * as SurveyState from '../state'
import { SurveyStatusState } from '../status'

// ==== Survey
export const useSurveyDefsFetched = (draft) => useSelector(SurveyStatusState.areDefsFetched(draft))
export const useSurvey = () => useSelector(SurveyState.getSurvey)
export const useSurveyId = () => useSelector(SurveyState.getSurveyId)
export const useSurveyInfo = () => useSelector(SurveyState.getSurveyInfo)
export const useSurveyCycleKey = () => useSelector(SurveyState.getSurveyCycleKey)
export const useSurveyCycleKeys = () => useSelector(SurveyState.getSurveyCyclesKeys)

export const useSurveyLang = () => Survey.getLanguage(useLang())(useSurveyInfo())
export const useSurveyLangs = () => Survey.getLanguages(useSurveyInfo())

export const useOnSurveyCycleUpdate = (effect) => {
  const surveyCycleKey = useSurveyCycleKey()
  useOnUpdate(effect, [surveyCycleKey])
}

export const useNodeDefRootKeys = () => Survey.getNodeDefRootKeys(useSurvey())

// ==== Node defs
export const useNodeDefByUuid = (uuid) => Survey.getNodeDefByUuid(uuid)(useSurvey())
export const useNodeDefsByUuids = (uuids) => Survey.getNodeDefsByUuids(uuids)(useSurvey())

export const useNodeDefLabelByType = (nodeDef) =>
  NodeDef.getLabelWithType({ nodeDef, type: useSelector(SurveyFormState.getNodeDefDisplayType), lang: useSurveyLang() })

// ==== Categories
export const useCategoryByUuid = (uuid) => Survey.getCategoryByUuid(uuid)(useSurvey())
