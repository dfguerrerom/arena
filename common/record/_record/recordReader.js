const R = require('ramda')

const SurveyNodeDefs = require('../../survey/_internal/surveyNodeDefs')
const SurveyDependencies = require('../../survey/_internal/surveyDependencies')
const NodeDef = require('../../survey/nodeDef')
const Node = require('../node')

const keys = require('./recordKeys')
const NodesIndex = require('./recordNodesIndex')

/**
 * === simple getters
 */
const getNodes = R.propOr({}, keys.nodes)

const getNodeByUuid = uuid => R.path([keys.nodes, uuid])

const getRootNode = record => R.pipe(
  NodesIndex.getNodeRootUuid,
  uuid => getNodeByUuid(uuid)(record)
)(record)

const getNodesByDefUuid = nodeDefUuid => record => R.pipe(
  NodesIndex.getNodeUuidsByDef(nodeDefUuid),
  R.map(uuid => getNodeByUuid(uuid)(record))
)(record)

/**
 * ==== hierarchy
 */
// ancestors
const getParentNode = node => getNodeByUuid(Node.getParentUuid(node))

const getAncestorsAndSelf = entity => record => {
  const ancestors = []
  while (entity) {
    ancestors.push(entity)
    entity = getParentNode(entity)(record)
  }
  return ancestors
}

const getAncestorByNodeDefUuid = (node, ancestorDefUuid) => record =>
  R.pipe(
    getParentNode(node),
    parentNode => getAncestorsAndSelf(parentNode)(record),
    R.find(ancestor => Node.getNodeDefUuid(ancestor) === ancestorDefUuid)
  )(record)

// siblings
const getNodeSiblingsByDefUuid = (node, siblingDefUuid) => R.pipe(
  getParentNode(node),
  parentNode => getNodeChildrenByDefUuid(parentNode, siblingDefUuid)
)

// descendants
const getNodeChildren = node => record => R.pipe(
  NodesIndex.getNodeUuidsByParent(Node.getUuid(node)),
  R.map(uuid => getNodeByUuid(uuid)(record))
)(record)

const getNodeChildrenByDefUuid = (parentNode, nodeDefUuid) => record => R.pipe(
  NodesIndex.getNodeUuidsByParentAndDef(Node.getUuid(parentNode), nodeDefUuid),
  R.map(uuid => getNodeByUuid(uuid)(record)),
  nodes =>
    R.sortWith([
      R.propOr(false, Node.keys.placeholder),
      R.prop(Node.keys.dateCreated)
    ])(nodes)
)(record)

const getNodeChildByDefUuid = (parentNode, nodeDefUuid) => R.pipe(
  getNodeChildrenByDefUuid(parentNode, nodeDefUuid),
  R.head
)

/**
 * ==== dependency
 */
const getDependentNodes = (survey, node, dependencyType) => record => {
  const nodeDefUuid = Node.getNodeDefUuid(node)
  const nodeDef = SurveyNodeDefs.getNodeDefByUuid(nodeDefUuid)(survey)
  const dependentUuids = SurveyDependencies.getNodeDefDependencies(nodeDefUuid, dependencyType)(survey)
  const isDependencyApplicable = dependencyType === SurveyDependencies.dependencyTypes.applicable

  if (dependentUuids) {
    const dependentDefs = SurveyNodeDefs.getNodeDefsByUuids(dependentUuids)(survey)

    const dependentsPerDef = dependentDefs.map(
      dependentDef => {
        //1 find common parent def
        const commonParentDefUuid = R.pipe(
          R.intersection(NodeDef.getMetaHierarchy(nodeDef)),
          R.last
        )(NodeDef.getMetaHierarchy(dependentDef))

        //2 find common parent node
        const commonParentNode = getAncestorByNodeDefUuid(node, commonParentDefUuid)(record)

        //3 find descendant nodes of common parent node with nodeDefUuid = dependentDef uuid
        const nodeDefUuidDependent = isDependencyApplicable
          ? NodeDef.getParentUuid(dependentDef)
          : NodeDef.getUuid(dependentDef)

        const dependentNodes = R.pipe(
          getNodesByDefUuid(nodeDefUuidDependent),
          R.filter(node =>
            Node.isDescendantOf(commonParentNode)(node) ||
            (
              isDependencyApplicable && Node.getUuid(node) === Node.getUuid(commonParentNode)
            )
          )
        )(record)

        return dependentNodes.map(nodeCtx => ({
          nodeDef: dependentDef,
          nodeCtx
        }))
      }
    )

    return R.flatten(dependentsPerDef)
  } else {
    return []
  }
}

// code attributes
const getDependentCodeAttributes = node => record => R.pipe(
  NodesIndex.getNodeCodeDependentUuids(Node.getUuid(node)),
  R.map(uuid => getNodeByUuid(uuid)(record))
)(record)

const getParentCodeAttribute = (survey, parentNode, nodeDef) => record => {
  const parentCodeDefUuid = NodeDef.getParentCodeDefUuid(nodeDef)

  if (parentCodeDefUuid) {
    const ancestors = getAncestorsAndSelf(parentNode)(record)
    for (const ancestor of ancestors) {
      const children = getNodeChildren(ancestor)(record)
      const nodeFound = children.find(node => Node.getNodeDefUuid(node) === parentCodeDefUuid)
      if (nodeFound)
        return nodeFound
    }
  }
  return null
}

// ====== Keys

const getEntityKeyNodes = (survey, nodeEntity) => record => {
  const nodeDefEntity = SurveyNodeDefs.getNodeDefByUuid(Node.getNodeDefUuid(nodeEntity))(survey)
  const nodeDefKeys = SurveyNodeDefs.getNodeDefKeys(nodeDefEntity)(survey)

  return R.pipe(
    R.map(nodeDefKey => getNodeChildByDefUuid(nodeEntity, NodeDef.getUuid(nodeDefKey))(record)),
    R.flatten,
  )(nodeDefKeys)
}

const getEntityKeyValues = (survey, nodeEntity) => R.pipe(
  getEntityKeyNodes(survey, nodeEntity),
  R.map(Node.getValue)
)

module.exports = {
  getNodes,
  getNodeByUuid,
  getRootNode,
  getNodesByDefUuid,

  // ==== hierarchy
  // ancestors
  getParentNode,
  getAncestorsAndSelf,
  getAncestorByNodeDefUuid,

  // siblings
  getNodeSiblingsByDefUuid,

  // descendants
  getNodeChildren,
  getNodeChildrenByDefUuid,
  getNodeChildByDefUuid,

  // ==== dependency
  getDependentNodes,

  // code
  getParentCodeAttribute,
  getDependentCodeAttributes,

  // ====== Keys
  getEntityKeyNodes,
  getEntityKeyValues,
}