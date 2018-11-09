const fastcsv = require('fast-csv')
const R = require('ramda')

const {languageCodes} = require('../../common/app/languages')
const {isNotBlank} = require('../../common/stringUtils')
const {jobStatus} = require('../../common/job/job')
const Taxonomy = require('../../common/survey/taxonomy')
const Job = require('../../server/job/job')
const {validateTaxon} = require('../../server/taxonomy/taxonomyValidator')

const requiredColumns = [
  'code',
  'family',
  'genus',
  'scientific_name',
]

class TaxonomyImportJob extends Job {

  constructor (userId, surveyId, name, taxonomyId, inputBuffer, taxaPersistFunction) {
    super(userId, surveyId, name)

    this.taxonomyId = taxonomyId
    this.inputBuffer = inputBuffer
    this.csvString = inputBuffer.toString('utf8')
    this.taxaPersistFunction = taxaPersistFunction

    this.csvStreamEnded = false
  }

  start () {
    super.start()

    console.log(`parsing csv file. size ${this.inputBuffer.length}`)

    this.result = {
      taxa: [],
      vernacularLanguageCodes: [],
    }

    this.processHeaders(validHeaders => {
      console.log(`headers processed. valid: ${validHeaders}`)

      if (!validHeaders) {
        this.changeStatus(jobStatus.failed)
        return
      }
      this.calculateSize(totalItems => {
        console.log(`total rows: ${totalItems}`)

        this.totalItems = totalItems
        this.processedItems = 0

        const csvStream = fastcsv.fromString(this.csvString, {headers: true})
          .on('data', async data => {
            csvStream.pause()

            if (this.isCancelled()) {
              csvStream.destroy()
            } else {
              await this.processRow(data)
              csvStream.resume()
            }
          })
          .on('end', () => {
            this.csvStreamEnded = true
            //do not throw immediately "end" event, last item still being processed
          })
      })
    })
    return this
  }

  calculateSize (callback) {
    let count = 0
    fastcsv.fromString(this.csvString, {headers: true})
      .on('data', () => count++)
      .on('end', () => callback(count))
  }

  processHeaders (callback) {
    const csvStream = fastcsv.fromString(this.csvString, {headers: false})
    csvStream.on('data', async columns => {
      csvStream.destroy() //stop streaming CSV
      const validHeaders = this.validateHeaders(columns)
      if (validHeaders) {
        this.result.vernacularLanguageCodes = R.innerJoin((a, b) => a === b, languageCodes, columns)
      }
      callback(validHeaders)
    })
  }

  async processRow (data) {
    const {result, surveyId, taxonomyId} = this

    const taxonParseResult = await this.parseTaxon(data)

    if (taxonParseResult.taxon) {
      result.taxa.push(taxonParseResult.taxon)
    } else {
      this.errors['' + (this.processedItems + 1)] = taxonParseResult.errors
    }
    this.incrementProcessedItems()

    if (this.csvStreamEnded) {
      const hasErrors = !R.isEmpty(R.keys(this.errors))
      if (hasErrors) {
        this.changeStatus(jobStatus.failed)
      } else {
        await this.taxaPersistFunction(surveyId, taxonomyId, result.taxa, result.vernacularLanguageCodes)
        this.changeStatus(jobStatus.completed)
      }
    }
  }

  validateHeaders (columns) {
    const missingColumns = R.difference(requiredColumns, columns)
    if (R.isEmpty(missingColumns)) {
      return true
    } else {
      this.errors[0] = `Missing required columns: ${R.join(', ', missingColumns)}`
      return false
    }
  }

  async parseTaxon (data) {
    const {family, genus, scientific_name, code, ...vernacularNames} = data

    const taxon = R.assoc('props', {
      code,
      family,
      genus,
      scientificName: scientific_name,
      vernacularNames: this.parseVernacularNames(vernacularNames)
    })(Taxonomy.newTaxon(this.taxonomyId))

    const validation = await validateTaxon(this.result.taxa, taxon)

    return validation.valid
      ? {taxon}
      : {errors: validation.fields}
  }

  parseVernacularNames (vernacularNames) {
    return R.reduce((acc, langCode) => {
      const vernacularName = vernacularNames[langCode]
      return isNotBlank(vernacularName) ? R.assoc(langCode, vernacularName, acc) : acc
    }, {}, this.result.vernacularLanguageCodes)
  }

}

module.exports = TaxonomyImportJob
