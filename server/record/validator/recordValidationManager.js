const R = require('ramda')
const Promise = require('bluebird')

const Survey = require('../../../common/survey/survey')
const NodeDef = require('../../../common/survey/nodeDef')

const Node = require('../../../common/record/node')
const Validator = require('../../../common/validation/validator')

const RecordRepository = require('../recordRepository')
const NodeRepository = require('../nodeRepository')

const CountValidator = require('./helpers/countValidator')
const DependentsValidator = require('./helpers/dependentNodesValidator')

const validateNodes = async (survey, recordUuid, nodes, tx) => {

  // 1. validate self and dependent nodes (validations/expressions)
  const nodesDependentValidations = await DependentsValidator.validateSelfAndDependentNodes(survey, recordUuid, nodes, tx)

  // 2. validate min/max count
  const nodePointers = await fetchNodePointers(survey, nodes, tx)
  const nodeCountValidations = await CountValidator.validateChildrenCount(survey, recordUuid, nodePointers, tx)

  // 3. merge validations
  const nodesValidation = {
    fields: R.mergeLeft(nodeCountValidations, nodesDependentValidations)
  }

  // persist validation
  const record = await RecordRepository.fetchRecordByUuid(Survey.getId(survey), recordUuid, tx)

  const recordValidationUpdated = R.pipe(
    Validator.mergeValidation(nodesValidation),
    Validator.getValidation
  )(record)

  await RecordRepository.updateValidation(Survey.getId(survey), recordUuid, recordValidationUpdated, tx)

  return nodesValidation
}


const fetchNodePointers = async (survey, nodes, tx) => {
  const nodesArray = R.values(nodes)

  const nodePointers = await Promise.all(
    nodesArray.map(
      async node => {
        const pointers = []
        const nodeDef = Survey.getNodeDefByUuid(Node.getNodeDefUuid(node))(survey)

        if (NodeDef.isNodeDefEntity(nodeDef)) {
          const childDefs = Survey.getNodeDefChildren(nodeDef)(survey)

          pointers.push(
            childDefs.map(
              childDef => ({
                nodeCtx: node,
                nodeDef: childDef
              })
            )
          )
        }
        if (!NodeDef.isNodeDefRoot(nodeDef)) {
          const parent = await NodeRepository.fetchNodeByUuid(Survey.getId(survey), Node.getParentUuid(node), tx)
          pointers.push({
            nodeCtx: parent,
            nodeDef
          })
        }
        return pointers
      }
    )
  )
  return R.pipe(
    R.flatten,
    R.uniq
  )(nodePointers)
}

module.exports = {
  validateNodes
}