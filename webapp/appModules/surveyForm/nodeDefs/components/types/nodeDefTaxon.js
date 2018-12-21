import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import axios from 'axios'
import * as R from 'ramda'

import { FormItem, Input } from '../../../../../commonComponents/form/input'
import AutocompleteDialog from '../../../../../commonComponents/form/autocompleteDialog'

import { toQueryString } from '../../../../../../server/serverUtils/request'

import Taxonomy from '../../../../../../common/survey/taxonomy'
import NodeDef from '../../../../../../common/survey/nodeDef'
import Node from '../../../../../../common/record/node'

import { nodeDefRenderType } from '../../../../../../common/survey/nodeDefLayout'
import { getStateSurveyId } from '../../../../../survey/surveyState'

const {valuePropKeys} = Node

const fields = {
  code: 'code',
  scientificName: 'scientificName',
  vernacularName: 'vernacularName',
}

const defaultFieldValues = {
  code: '',
  scientificName: '',
  vernacularName: ''
}

const defaultState = {
  ...defaultFieldValues,
  selectedTaxon: null,
  dirty: false,
  autocompleteOpened: false,
  autocompleteTaxa: [],
  autocompleteInputField: null,
}

const loadTaxa = async (surveyId, taxonomyUuid, field, value, strict = false) => {
  const searchValue =
    strict ? value
      : field === fields.code
      ? `${value}*` //starts with value
      : `*${value}*` //contains value

  const params = {
    draft: false,
    limit: 20,
    offset: 0,
    filter: {
      [field]: searchValue,
    },
    includeUnlUnk: true
  }

  const {data} = await axios.get(`/api/survey/${surveyId}/taxonomies/${taxonomyUuid}/taxa?${toQueryString(params)}`)
  return data.taxa
}

const loadTaxonByNode = async (surveyId, taxonomyUuid, node) => {
  const vernacularNameUuid = Node.getNodeVernacularNameUuid(node)

  const filterProp = vernacularNameUuid ? valuePropKeys.vernacularNameUuid : 'uuid'
  const filterPropValue = vernacularNameUuid ? vernacularNameUuid : Node.getNodeTaxonUuid(node)

  return filterPropValue
    ? R.head(await loadTaxa(surveyId, taxonomyUuid, filterProp, filterPropValue, true))
    : null
}

const TaxonAutocompleteItemRenderer = props => {
  const {item: taxon, ...otherProps} = props

  const vernacularNames = Taxonomy.getTaxonVernacularNames(taxon)
  const vernacularNamesString = R.pipe(
    R.keys, //vernacular language codes
    R.map(langCode => `${R.prop(langCode, vernacularNames)} (${langCode})`),
    R.join(' / ')
  )(vernacularNames)

  return <div {...otherProps}
              key={taxon.uuid}
              className="item"
              tabIndex="1">
    <div>{Taxonomy.getTaxonCode(taxon)}</div>
    <div>{Taxonomy.getTaxonScientificName(taxon)}</div>
    <div style={{gridColumn: 2}}>{vernacularNamesString}</div>
  </div>
}

class NodeDefTaxon extends React.Component {

  constructor (props) {
    super(props)

    this.codeField = React.createRef()
    this.scientificNameField = React.createRef()
    this.vernacularNameField = React.createRef()

    this.state = defaultState
  }

  getInputFields () {
    return {
      code: this.codeField,
      scientificName: this.scientificNameField,
      vernacularName: this.vernacularNameField,
    }
  }

  async componentDidMount () {
    if (this.props.entry) {
      await this.loadSelectedTaxonFromNode()
    }
  }

  async componentDidUpdate (prevProps) {
    if (this.props.entry && !R.equals(prevProps.nodes, this.props.nodes)) {
      await this.loadSelectedTaxonFromNode()
    }
  }

  async loadSelectedTaxonFromNode () {
    const {surveyId, taxonomyUuid, nodes} = this.props
    const node = nodes[0]

    const taxon = node ? await loadTaxonByNode(surveyId, taxonomyUuid, node) : null

    this.updateStateFromTaxon(taxon)
  }

  updateStateFromTaxon (taxon) {
    const {nodes} = this.props
    const node = nodes[0]

    if (taxon) {
      const code = Taxonomy.getTaxonCode(taxon)
      const unlisted = code === Taxonomy.unlistedCode
      const scientificName = unlisted ? Node.getNodeScientificName(node) : Taxonomy.getTaxonScientificName(taxon)
      const vernacularName = unlisted ? Node.getNodeVernacularName(node) : taxon.vernacularName

      this.setState({
        selectedTaxon: taxon,
        code,
        scientificName,
        vernacularName,
        autocompleteOpened: false,
        autocompleteTaxa: [],
        autocompleteInputField: null,
      })
    } else {
      this.setState(defaultState)
    }
  }

  async onInputFieldChange (field, value) {
    if (this.state.code === Taxonomy.unlistedCode && field !== fields.code) {
      this.handleUnlistedSpeciesFieldChange(field, value)
    } else {
      //reset other field values
      const fieldValues = R.assoc(field, value)(defaultFieldValues)

      const emptyValue = R.isEmpty(value)

      this.setState({
        ...fieldValues,
        dirty: true,
        autocompleteOpened: !emptyValue,
        autocompleteTaxa: [],
        autocompleteInputField: this.getInputFields()[field]
      })

      if (emptyValue) {
        //reset node value
        this.updateNodeValue(null)
      } else {
        //show autocomplete
        await this.loadAutocompleteTaxa(field, value)
      }
    }
  }

  handleUnlistedSpeciesFieldChange (field, value) {
    const node = this.props.nodes[0]
    const unlistedTaxonUuid = Node.getNodeTaxonUuid(node)

    this.setState({
      [field]: value,
      dirty: true
    })
    const scientificName = field === fields.scientificName ? value : Node.getNodeScientificName(node)
    const vernacularName = field === fields.vernacularName ? value : Node.getNodeVernacularName(node)

    this.updateNodeValue({
      [valuePropKeys.taxonUuid]: unlistedTaxonUuid,
      [valuePropKeys.scientificName]: scientificName,
      [valuePropKeys.vernacularName]: vernacularName,
    })
  }

  onTaxonSelect (item) {
    let nodeValue = null

    if (Taxonomy.getTaxonCode(item) === Taxonomy.unlistedCode) {
      const {scientificName, vernacularName} = this.state
      //unlisted item
      nodeValue = {
        [valuePropKeys.taxonUuid]: item.uuid,
        [valuePropKeys.scientificName]: scientificName ? scientificName : Taxonomy.getTaxonScientificName(item),
        [valuePropKeys.vernacularName]: vernacularName ? vernacularName : '',
      }
    } else {
      //item in list
      nodeValue = {
        [valuePropKeys.taxonUuid]: item.uuid
      }
      if (item.vernacularNameUuid) {
        nodeValue[valuePropKeys.vernacularNameUuid] = item.vernacularNameUuid
      }
    }

    this.updateStateFromTaxon(item)

    this.updateNodeValue(nodeValue)
  }

  updateNodeValue (value) {
    const {nodeDef, nodes, updateNode} = this.props

    updateNode(nodeDef, nodes[0], value)
  }

  onAutocompleteClose () {
    //reset state using previously selected taxon
    this.updateStateFromTaxon(this.state.selectedTaxon)
  }

  async loadAutocompleteTaxa (field, value) {
    const {surveyId, taxonomyUuid} = this.props

    const taxa = await loadTaxa(surveyId, taxonomyUuid, field, value)
    this.setState({autocompleteTaxa: taxa})
  }

  render () {
    const {
      edit, renderType
    } = this.props

    const {
      code,
      scientificName,
      vernacularName,

      autocompleteOpened,
      autocompleteTaxa,
      autocompleteInputField,
    } = this.state

    const codeInputField = <Input ref={this.codeField}
                                  readOnly={edit}
                                  value={code}
                                  onChange={value => this.onInputFieldChange(fields.code, value)}/>

    const scientificNameInputField = <Input ref={this.scientificNameField}
                                            readOnly={edit}
                                            value={scientificName}
                                            onChange={value => this.onInputFieldChange(fields.scientificName, value)}/>

    const vernacularNameInputField = <Input ref={this.vernacularNameField}
                                            readOnly={edit}
                                            value={vernacularName}
                                            onChange={value => this.onInputFieldChange(fields.vernacularName, value)}/>

    const autocompleteDialog =
      autocompleteOpened
        ? ReactDOM.createPortal(
        <AutocompleteDialog className="node-def__taxon-autocomplete-list"
                            items={autocompleteTaxa}
                            itemRenderer={TaxonAutocompleteItemRenderer}
                            itemKeyFunction={taxon => `${taxon.uuid}_${taxon.vernacularName}`}
                            inputField={autocompleteInputField.current.component.input}
                            onItemSelect={taxonSearchResult => this.onTaxonSelect(taxonSearchResult)}
                            onClose={() => this.onAutocompleteClose()}/>,
        document.body
        )
        : null

    if (renderType === nodeDefRenderType.tableBody) {
      return <div className="node-def__table-row-taxon node-def__table-data-composite-attr">
        {codeInputField}
        {scientificNameInputField}
        {vernacularNameInputField}

        {autocompleteDialog}
      </div>
    }

    return (
      <div className="node-def__taxon-wrapper">
        <FormItem label="Code">
          {codeInputField}
        </FormItem>
        <FormItem label="Scientific Name">
          {scientificNameInputField}
        </FormItem>
        <FormItem label="Vernacular Name">
          {vernacularNameInputField}
        </FormItem>

        {autocompleteDialog}
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  taxonomyUuid: NodeDef.getNodeDefTaxonomyUuid(props.nodeDef),
  surveyId: getStateSurveyId(state)
})

export default connect(mapStateToProps)(NodeDefTaxon)