const { insertAllQuery } = require('../../../db/dbUtils')

const Survey = require('../../../../common/survey/survey')
const NodeDef = require('../../../../common/survey/nodeDef')
const SchemaRdb = require('../../../../common/surveyRdb/schemaRdb')
const NodeDefTable = require('../../../../common/surveyRdb/nodeDefTable')

const SurveySchemaRepository = require('../../survey/repository/surveySchemaRepositoryUtils')

const DataTable = require('../schemaRdb/dataTable')

const run = async (survey, nodeDef, client) => {

  const surveyId = Survey.getId(survey)
  const surveySchema = SurveySchemaRepository.getSurveyDBSchema(surveyId)

  const nodeDefParent = Survey.getNodeDefParent(nodeDef)(survey)
  const nodeDefUuid = NodeDef.getUuid(nodeDef)
  const nodeDefColumns = DataTable.getNodeDefColumns(survey, nodeDef)

  const selectNodeRows = `
      SELECT
        n.id, n.uuid, n.node_def_uuid, n.record_uuid, n.parent_uuid, n.value
      FROM
        ${surveySchema}.node n
        WHERE n.node_def_uuid = $1
        ORDER BY n.id
        
    `
  const selectQuery = NodeDef.isEntity(nodeDef)
    ? `
        WITH
          n AS
          (${selectNodeRows})
        SELECT
          n.* ,
          c.children
        FROM
          n
        LEFT OUTER JOIN
          (
            SELECT
              c.parent_uuid,
              json_object_agg(c.node_def_uuid::text, json_build_object('uuid',c.uuid, 'nodeDefUuid', c.node_def_uuid,'value',c.value)) children
            FROM
              ${surveySchema}.node c
            WHERE
              c.parent_uuid in (select uuid from n)
            AND c.value IS NOT NULL
            GROUP BY
              c.parent_uuid ) c
        ON
          n.uuid = c.parent_uuid
        `
    : selectNodeRows

  // 1. create materialized view
  const vName = `${surveySchema}.m_view_data`
  await client.none(`CREATE MATERIALIZED VIEW ${vName} AS ${selectQuery}`, [nodeDefUuid])

  const { count } = await client.one(
    `SELECT count(*) FROM ${vName}`,
  )

  const limit = 5000
  const noIter = Math.ceil(count / limit)
  for (let i = 0; i < noIter; i++) {
    const offset = i * limit

    // 2. fetch nodes
    const nodes = await client.any(`select * from ${vName} ORDER BY id OFFSET ${offset} LIMIT ${limit}  `)

    // 3. convert nodes into values
    const nodesRowValues = nodes.map(
      nodeRow => DataTable.getRowValues(survey, nodeDef, nodeRow, nodeDefColumns)
    )

    // 4. insert node values
    await client.none(insertAllQuery(
      SchemaRdb.getName(surveyId),
      NodeDefTable.getTableName(nodeDef, nodeDefParent),
      DataTable.getColumnNames(survey, nodeDef),
      nodesRowValues
    ))

  }

  // 5. drop materialized view
  await client.none(`DROP MATERIALIZED VIEW ${vName}`)
}

module.exports = {
  run
}