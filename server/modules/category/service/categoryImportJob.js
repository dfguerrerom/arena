const R = require('ramda')

const Job = require('../../../job/job')

const Category = require('../../../../common/survey/category')
const CategoryImportSummary = require('../../../../common/survey/categoryImportSummary')
const CategoryLevel = require('../../../../common/survey/categoryLevel')
const CategoryItem = require('../../../../common/survey/categoryItem')
const Validator = require('../../../../common/validation/validator')
const ValidatorErrorKeys = require('../../../../common/validation/validatorErrorKeys')
const StringUtils = require('../../../../common/stringUtils')
const ObjectUtils = require('../../../../common/objectUtils')

const CategoryManager = require('../manager/categoryManager')
const CategoryImportCSVParser = require('./categoryImportCSVParser')
const CategoryImportJobParams = require('./categoryImportJobParams')

class CategoryImportJob extends Job {

  constructor (params) {
    super(CategoryImportJob.type, params)

    this.itemsByCodes = {} // cache of category items by ancestor codes
  }

  async execute () {
    // levels
    let category = await this._importLevels()

    // item extra def
    category = await this._importItemExtraDef(category)

    // items
    await this._readItems(category)

    if (this.hasErrors()) {
      // errors found
      this.logDebug(`${Object.keys(this.errors).length} errors found`)
      await this.setStatusFailed()
    } else {
      // no errors found
      await this.insertItems()
    }
  }

  async _importLevels () {
    this.logDebug('importing levels')

    const categoryUuid = CategoryImportJobParams.getCategoryUuid(this.params)
    const summary = CategoryImportJobParams.getSummary(this.params)

    const surveyId = this.getSurveyId()
    const user = this.getUser()

    let category = await CategoryManager.deleteLevelsByCategory(user, surveyId, categoryUuid, this.tx)

    const levelNames = CategoryImportSummary.getLevelNames(summary)

    for (const levelName of levelNames) {
      const levelToInsert = Category.newLevel(category, {
        [CategoryLevel.props.name]: levelName
      })
      const level = await CategoryManager.insertLevel(user, surveyId, levelToInsert, this.tx)
      category = Category.assocLevel(level)(category)
    }

    this.logDebug(`levels imported: ${levelNames}`)

    return category
  }

  async _importItemExtraDef (category) {
    this.logDebug('importing item extra def')

    const summary = CategoryImportJobParams.getSummary(this.params)

    const itemExtraDef = Object.entries(CategoryImportSummary.getColumns(summary)).reduce((accExtraDef, [columnName, column]) => {
        if (CategoryImportSummary.isColumnExtra(column)) {
          accExtraDef[columnName] = R.pick([CategoryImportSummary.keysColumn.dataType])(column)
        }
        return accExtraDef
      },
      {}
    )
    if (!R.isEmpty(itemExtraDef)) {
      const categoryUuid = CategoryImportJobParams.getCategoryUuid(this.params)
      await CategoryManager.updateCategoryProp(this.getUser(), this.getSurveyId(), categoryUuid, Category.props.itemExtraDef, itemExtraDef, this.tx)
      category = Category.assocItemExtraDef(itemExtraDef)(category)
    }

    this.logDebug('item extra def imported', itemExtraDef)

    return category
  }

  async _readItems (category) {
    this.logDebug('reading items')

    const summary = CategoryImportJobParams.getSummary(this.params)

    this.logDebug('summary', summary)

    const levels = Category.getLevelsArray(category)

    const reader = await CategoryImportCSVParser.createRowsReader(
      summary,
      async itemRow => {
        if (this.isCanceled()) {
          reader.cancel()
          return
        }
        await this._onRow(itemRow, levels)
      },
      total => this.total = total
    )

    await reader.start()

    this.logDebug(`${this.total} items read`)

    if (this.total === 0)
      this.addError({
        error: {
          [Validator.keys.valid]: false,
          [Validator.keys.errors]: [{
            key: ValidatorErrorKeys.categoryImport.emptyFile
          }]
        }
      })
  }

  async _onRow (itemRow, levels) {
    const { levelIndexDeeper, codes, labelsByLevel, descriptionsByLevel, extra } = itemRow

    if (this._checkCodesNotEmpty(codes)) {
      for (let levelIndex = 0; levelIndex <= levelIndexDeeper; levelIndex++) {
        const level = levels[levelIndex]
        const levelName = CategoryLevel.getName(level)

        const codesLevel = codes.slice(0, levelIndex + 1)

        const alreadyInserted = !!this.itemsByCodes[codesLevel]

        if (alreadyInserted) {
          if (levelIndex === levelIndexDeeper) {
            this._addErrorCodeDuplicate(codesLevel)
          }
        } else {
          let itemParentUuid = null
          if (levelIndex > 0) {
            const codesParent = codesLevel.slice(0, levelIndex)

            const itemParent = this.itemsByCodes[codesParent]
            itemParentUuid = CategoryItem.getUuid(itemParent)
          }

          const codeLevel = codesLevel[codesLevel.length - 1]

          const itemProps = {
            [CategoryItem.props.code]: codeLevel
          }

          ObjectUtils.setInPath([ObjectUtils.keysProps.labels], labelsByLevel[levelName], false)(itemProps)
          ObjectUtils.setInPath([ObjectUtils.keysProps.descriptions], descriptionsByLevel[levelName], false)(itemProps)
          ObjectUtils.setInPath([CategoryItem.props.extra], extra, false)(itemProps)

          this.itemsByCodes[codesLevel] = CategoryItem.newItem(
            CategoryLevel.getUuid(level),
            itemParentUuid,
            itemProps
          )
        }
      }
    }
    this.incrementProcessedItems()
  }

  async insertItems () {
    this.logDebug('inserting items')

    const surveyId = this.getSurveyId()
    const user = this.getUser()

    const items = Object.values(this.itemsByCodes)
    await CategoryManager.insertItems(user, surveyId, items, this.tx)

    this.logDebug(`${items.length} items imported`)
  }

  _checkCodesNotEmpty (codes) {
    let errorsFound = false

    if (codes.length === 0) {
      this.addErrorCodeRequired(0)
      errorsFound = true
    } else {
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i]
        if (StringUtils.isBlank(code)) {
          this.addErrorCodeRequired(i)
          errorsFound = true
        }
      }
    }
    return !errorsFound
  }

  _addErrorCodeDuplicate (codes) {
    const levelIndex = codes.length - 1
    const code = codes[levelIndex]
    const summary = CategoryImportJobParams.getSummary(this.params)
    const columnName = CategoryImportSummary.getColumnName(CategoryImportSummary.columnTypes.code, levelIndex)(summary)

    this.addError({
      error: {
        [Validator.keys.valid]: false,
        [Validator.keys.errors]: [{
          key: ValidatorErrorKeys.categoryImport.codeDuplicate,
          params: {
            columnName,
            code
          }
        }]
      }
    })
  }

  addErrorCodeRequired (levelIndex) {
    const summary = CategoryImportJobParams.getSummary(this.params)

    const columnName = CategoryImportSummary.getColumnName(CategoryImportSummary.columnTypes.code, levelIndex)(summary)

    this.addError({
      error: {
        [Validator.keys.valid]: false,
        [Validator.keys.errors]: [{
          key: ValidatorErrorKeys.categoryImport.codeRequired,
          params: {
            columnName
          }
        }]
      }
    })
  }
}

CategoryImportJob.type = 'CategoryImportJob'

module.exports = CategoryImportJob
