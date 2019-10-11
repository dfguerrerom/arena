import React from 'react'

import { appModules, appModuleUri, analysisModules } from '../../appModules'

import InnerModuleSwitch from '../components/innerModuleSwitch'
import SurveyDefsLoader from '../../surveyViews/surveyDefsLoader/surveyDefsLoader'
import ProcessingChainsView from './processingChains/processingChainsView'
import ProcessingChainView from './processingChain/processingChainView'

const AnalysisView = () => (
  <SurveyDefsLoader
    draft={false}
    validate={false}
    requirePublish={true}>
    <InnerModuleSwitch
      moduleRoot={appModules.analysis}
      moduleDefault={analysisModules.processingChains}
      modules={[
        {
          component: ProcessingChainsView,
          path: appModuleUri(analysisModules.processingChains),
        },
        {
          component: ProcessingChainView,
          path: `${appModuleUri(analysisModules.processingChain)}:processingChainUuid/`,
        },
      ]}
    />
  </SurveyDefsLoader>
)

export default AnalysisView