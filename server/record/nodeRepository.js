const camelize = require('camelize')
const db = require('../db/db')

const {getSurveyDBSchema} = require('../../common/survey/survey')

const dbTransformCallback = camelize

// ============== CREATE

const insertNode = async (surveyId, node, client = db) =>
  await client.one(`
    INSERT INTO ${getSurveyDBSchema(surveyId)}.node 
    (record_id, parent_id, node_def_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [node.recordId, node.parentId, node.nodeDefId],
    dbTransformCallback
  )

// ============== READ

const fetchNodes = async (surveyId, recordId, client = db) =>
  await client.map(`
    SELECT * FROM ${getSurveyDBSchema(surveyId)}.node 
    WHERE record_id = $1 
    ORDER BY parent_id, id`,
    [recordId],
    dbTransformCallback
  )

// ============== UPDATE
const updateNode = async (surveyId, nodeId, value, client = db) =>
  await client.one(`
    UPDATE ${getSurveyDBSchema(surveyId)}.node 
    SET value = $1 
    WHERE id = $2
    RETURNING *
    `, [value, nodeId],
    dbTransformCallback
  )

// ============== DELETE
const deleteNode = async (surveyId, nodeId, client = db) =>
  await client.one(`
    DELETE ${getSurveyDBSchema(surveyId)}.node
    WHERE id = $1
    RETURNING *
    `, [nodeId],
    dbTransformCallback
  )

module.exports = {
  //CREATE
  insertNode,

  //READ
  fetchNodes,

  //UPDATE
  updateNode,

  //DELETE
  deleteNode,
}