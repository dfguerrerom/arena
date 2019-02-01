const R = require('ramda')
const Promise = require('bluebird')

const Survey = require('../../../../common/survey/survey')
const NodeDef = require('../../../../common/survey/nodeDef')
const NodeDefExpression = require('../../../../common/survey/nodeDefExpression')
const NodeDefValidations = require('../../../../common/survey/nodeDefValidations')
const { dependencyTypes } = require('../../../survey/surveyDependenchyGraph')
const Validator = require('../../../../common/validation/validator')
const Node = require('../../../../common/record/node')

const NodeDependencyManager = require('../../nodeDependencyManager')

const TypeValidator = require('./typeValidator')

const RecordExprParser = require('../../recordExprParser')

const errorKeys = {
  required: 'required',
  invalidValue: 'invalidValue',
}

const validateRequired = (survey, nodeDef) =>
  (propName, node) =>
    Node.isNodeValueBlank(node) &&
    (NodeDef.isNodeDefKey(nodeDef) || NodeDefValidations.isRequired(NodeDef.getValidations(nodeDef)))
      ? errorKeys.required
      : null

const validateNodeValidations = (survey, nodeDef, tx) =>
  async (propName, node) => {
    if (Node.isNodeValueBlank(node)) {
      return null
    }
    const validations = NodeDef.getValidations(nodeDef)

    const expressions = NodeDefValidations.getExpressions(validations)
    const applicableExpressions = await RecordExprParser.getApplicableExpressions(survey, node, expressions, tx)

    const applicableExpressionsEvaluated = await Promise.all(
      applicableExpressions.map(
        async expr => {
          const valid = await RecordExprParser.evalNodeQuery(survey, node, NodeDefExpression.getExpression(expr), tx)
          const defaultLang = Survey.getDefaultLanguage(Survey.getSurveyInfo(survey))
          const message = NodeDefExpression.getMessage(defaultLang, errorKeys.invalidValue)(expr)

          return {
            valid,
            message
          }
        }
      ))

    const invalidExpressions = R.filter(R.propEq('valid', false), applicableExpressionsEvaluated)

    return R.isEmpty(invalidExpressions)
      ? null
      : R.pipe(
        R.pluck('message'),
        R.join('; ')
      )(invalidExpressions)
  }

const validateAttribute = async (survey, attribute, nodeDef, validatedNodeUuids, tx) => {
  if (Node.isDeleted(attribute)) {
    return null
  }

  const nodeUuid = Node.getUuid(attribute)

  // mark attribute validated
  validatedNodeUuids.push(nodeUuid)

  return {
    [nodeUuid]: await Validator.validate(attribute, {
      [Node.keys.value]: [
        validateRequired(survey, nodeDef),
        TypeValidator.validateValueType(survey, nodeDef),
        validateNodeValidations(survey, nodeDef, tx)
      ]
    })
  }
}

const validateSelfAndDependentAttributes = async (survey, nodes, tx) => {

  const attributes = R.pipe(
    R.values,
    R.filter(node => NodeDef.isNodeDefAttribute(getNodeDef(survey, node)))
  )(nodes)

  const validatedAttributeUuids = [] //used to avoid validating 2 times the same attributes

  const nodesValidationArray = await Promise.all(
    attributes.map(
      async attribute => {
        const dependents = await NodeDependencyManager.fetchDependentNodes(
          survey,
          attribute,
          dependencyTypes.validations,
          tx
        )
        const attributeAndDependents =
          R.includes(dep => R.equals(attribute, dep.nodeCtx))(dependents)
            ? dependents
            : R.append({
              nodeDef: getNodeDef(survey, attribute),
              nodeCtx: attribute
            })(dependents)

        return await Promise.all(
          attributeAndDependents.map(
            async ({ nodeCtx, nodeDef }) =>
              await validateAttribute(survey, nodeCtx, nodeDef, validatedAttributeUuids, tx)
          )
        )
      }
    )
  )

  return R.pipe(
    R.flatten,
    R.mergeAll
  )(nodesValidationArray)
}

const getNodeDef = (survey, node) =>
  Survey.getNodeDefByUuid(Node.getNodeDefUuid(node))(survey)

module.exports = {
  validateSelfAndDependentAttributes
}