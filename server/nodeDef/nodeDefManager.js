const R = require('ramda')
const db = require('../db/db')

const SurveyUtils = require('../../common/survey/surveyUtils')

const NodeDefRepository = require('./nodeDefRepository')

const {markSurveyDraft} = require('../survey/surveySchemaRepositoryUtils')

const ActivityLog = require('../activityLog/activityLogger')

// ======= CREATE

const createNodeDef = async (user, surveyId, parentUuid, uuid, type, props) =>
  await db.tx(async t => {
    const nodeDef = await NodeDefRepository.createNodeDef(surveyId, parentUuid, uuid, type, props, t)

    await markSurveyDraft(surveyId, t)

    await ActivityLog.log(user, surveyId, ActivityLog.type.nodeDefCreate, {parentUuid, uuid, type, props}, t)

    return nodeDef
  })

// ======= READ

const fetchNodeDefsByUuid = async (surveyId, nodeDefUuids = [], draft = false, validate = false) => {

  const nodeDefsDB = await NodeDefRepository.fetchNodeDefsByUuid(surveyId, nodeDefUuids, draft, validate)

  const nodeDefsResult = R.reduce(
    (acc, nodeDef) => draft
      ? R.append(nodeDef, acc)
      // remove draft and unpublished nodeDef
      : nodeDef.draft && !nodeDef.published
        ? acc
        : R.append(nodeDef, acc),
    [],
    nodeDefsDB
  )
  //TODO
  // const nodeDefs = validate
  //   ? await validateNodeDefs(nodeDefsResult)
  //   : nodeDefsResult
  // return SurveyUtils.toUuidIndexedObj(nodeDefs)

  return SurveyUtils.toUuidIndexedObj(nodeDefsResult)
}

// ======= UPDATE

const updateNodeDefProp = async (user, surveyId, nodeDefUuid, key, value, advanced = false) =>
  await db.tx(async t => {
    const nodeDef = await NodeDefRepository.updateNodeDefProp(surveyId, nodeDefUuid, key, value, advanced, t)

    await markSurveyDraft(surveyId, t)

    await ActivityLog.log(user, surveyId, ActivityLog.type.nodeDefUpdate, {nodeDefUuid, key, value, advanced}, t)

    return nodeDef
  })

// ======= DELETE

const markNodeDefDeleted = async (user, surveyId, nodeDefUuid) =>
  await db.tx(async t => {
    const nodeDef = await NodeDefRepository.markNodeDefDeleted(surveyId, nodeDefUuid, t)

    await markSurveyDraft(surveyId, t)

    await ActivityLog.log(user, surveyId, ActivityLog.type.nodeDefMarkDeleted, {nodeDefUuid}, t)

    return nodeDef
  })

module.exports = {
  createNodeDef,

  fetchNodeDefsByUuid,

  updateNodeDefProp,

  markNodeDefDeleted,
}