import { db } from '../../../../db/db'

import { TableStep, TableCalculation } from '../../../../../common/model/db'

/**
 * Fetch the calculation attribute definition uuids by the given parameters.
 *
 * @param {!object} params - The query parameters.
 * @param {!string} params.surveyId - The survey id.
 * @param {string} [params.chainUuid=null] - The chain uuid to filter by.
 * @param {string} [params.chainUuidExclude=null] - The chain uuid to exclude.
 * @param {number} [params.stepIndex=null] - The step index to filter by.
 * @param {boolean} [params.mapByUuid=false] - When true it returns the nodeDefUuids indexed by the calculation uuid, otherwise the nodeDefUuids array.
 * @param {pgPromise.IDatabase} [client=db] - The database client.
 *
 * @returns {Promise<string[]|object<string,string>>} - The result promise.
 */
export const fetchCalculationAttributeUuids = async (params, client = db) => {
  const { surveyId, chainUuid = null, chainUuidExclude = null, stepUuid = null, mapByUuid = false } = params

  const tableStep = new TableStep(surveyId)
  const tableCalculation = new TableCalculation(surveyId)

  let whereCondition = null
  let values = null
  if (chainUuid) {
    whereCondition = `${tableStep.columnChainUuid} = $1`
    values = [chainUuid]
  } else if (chainUuidExclude) {
    whereCondition = `${tableStep.columnChainUuid} <> $1`
    values = [chainUuidExclude]
  } else if (stepUuid) {
    whereCondition = `${tableStep.columnUuid} = $1`
    values = [stepUuid]
  }

  const { result } = await client.oneOrNone(
    `SELECT 
        jsonb_object_agg(${tableCalculation.columnUuid}, ${tableCalculation.columnNodeDefUuid}::text) AS result
    FROM ${tableCalculation.nameAliased}
    JOIN ${tableStep.nameAliased}
    ON ${tableStep.columnUuid} = ${tableCalculation.columnStepUuid}
    WHERE ${whereCondition}`,
    values
  )

  if (mapByUuid) {
    return result
  }
  return Object.values(result || {})
}
