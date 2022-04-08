import React, { useState } from 'react'

import * as Survey from '@core/survey/survey'
import * as NodeDef from '@core/survey/nodeDef'
import * as Category from '@core/survey/category'
import * as CategoryLevel from '@core/survey/categoryLevel'
import * as Chain from '@common/analysis/chain'

import CategorySelector from '@webapp/components/survey/CategorySelector'
import { FormItem } from '@webapp/components/form/Input'
import { useI18n } from '@webapp/store/system'
import { useSurvey } from '@webapp/store/survey'
import { Dropdown } from '@webapp/components/form'

export const ReportingDataAttributeDefs = (props) => {
  const { chain, updateChain } = props

  const i18n = useI18n()
  const survey = useSurvey()

  const [reportingDataCategory, setReportingDataCategory] = useState(null)

  return (
    <>
      <FormItem label={i18n.t('chainView.reportingDataCategory')}>
        <CategorySelector
          categoryUuid={Chain.getReportingDataCategoryUuid(chain)}
          filterFunction={Category.isReportingData}
          onChange={(category) => {
            updateChain(Chain.assocReportingDataCategoryUuid(Category.getUuid(category))(chain))
            if (!category) setReportingDataCategory(null)
          }}
          onCategoryLoad={setReportingDataCategory}
          showAdd={false}
          showManage={false}
        />
      </FormItem>
      {Category.getLevelsArray(reportingDataCategory).map((level) => {
        const categoryLevelUuid = CategoryLevel.getUuid(level)
        return (
          <FormItem
            key={categoryLevelUuid}
            label={i18n.t('chainView.reportingDataAttribute', { level: CategoryLevel.getName(level) })}
          >
            <Dropdown
              className="reporting-data-node-def-dropdown"
              items={Survey.getNodeDefsArray(survey).filter(
                (def) => NodeDef.isSingleAttribute(def) && !NodeDef.isAnalysis(def)
              )}
              selection={Survey.getNodeDefByUuid(Chain.getReportingDataAttributeDefUuid({ categoryLevelUuid })(chain))(
                survey
              )}
              itemKey="uuid"
              itemLabel={NodeDef.getName}
              onChange={(def) =>
                updateChain(
                  Chain.assocReportingDataAttributeDefUuid({
                    categoryLevelUuid,
                    nodeDefUuid: NodeDef.getUuid(def),
                  })(chain)
                )
              }
            />
          </FormItem>
        )
      })}
    </>
  )
}