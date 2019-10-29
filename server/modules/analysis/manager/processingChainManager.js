import db from '@server/db/db'

import * as ActivityLogRepository from '@server/modules/activityLog/repository/activityLogRepository'

import * as ProcessingChain from '@common/analysis/processingChain'

import * as ProcessingChainRepository from '../repository/processingChainRepository'

// ====== CREATE

export const createChain = async (user, surveyId, cycle, client = db) =>
  await client.tx(async t => {
    const processingChain = await ProcessingChainRepository.insertChain(surveyId, cycle, t)
    await ActivityLogRepository.log(user, surveyId, ActivityLogRepository.type.processingChainCreate,
      { processingChain }, false, t)
    return ProcessingChain.getUuid(processingChain)
  })

// ====== READ - Chain

export { countChainsBySurveyId, fetchChainsBySurveyId, fetchChainByUuid } from '../repository/processingChainRepository'

// ====== READ - Steps

export { fetchStepsByChainUuid } from '../repository/processingStepRepository'

// ====== UPDATE

export const updateChainProp = async (user, surveyId, processingChainUuid, key, value, client = db) =>
  await client.tx(async t => await Promise.all([
    ProcessingChainRepository.updateChainProp(surveyId, processingChainUuid, key, value, t),
    ActivityLogRepository.log(user, surveyId, ActivityLogRepository.type.processingChainPropUpdate,
      { uuid: processingChainUuid, key, value }, false, t)
  ]))

// ====== DELETE

export const deleteChain = async (user, surveyId, processingChainUuid, client = db) =>
  await client.tx(async t => await Promise.all([
    ProcessingChainRepository.deleteChain(surveyId, processingChainUuid, t),
    ActivityLogRepository.log(user, surveyId, ActivityLogRepository.type.processingChainDelete, { uuid: processingChainUuid }, false, t)
  ]))
