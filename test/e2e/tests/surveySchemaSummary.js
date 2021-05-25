import fs from 'fs'
import path from 'path'
import csv from 'csv/lib/sync'

import { DataTestId, getSelector } from '../../../webapp/utils/dataTestId'
import { downloadsPath } from '../paths'
import { gotoFormDesigner } from './_navigation'
import { cluster } from '../mock/nodeDefs'

const getTestNodeDefsOrderedByPath = () => {
  const items = []

  const stack = [{ parentPath: null, nodeDef: cluster }]
  while (stack.length) {
    const nodeDefItem = stack.shift()
    const { nodeDef, parentPath } = nodeDefItem
    const nodeDefPath = parentPath ? `${parentPath}.${nodeDef.name}` : nodeDef.name

    items.push({ nodeDef, path: nodeDefPath })

    if ('children' in nodeDef) {
      stack.push(
        ...Object.values(nodeDef.children).map((nodeDefChild) => ({
          parentPath: nodeDefPath,
          nodeDef: nodeDefChild,
        }))
      )
    }
  }
  // sort items by path
  return items.sort((item1, item2) => {
    const path1 = item1.path
    const path2 = item2.path
    if (path1 > path2) return 1
    if (path2 > path1) return -1
    return 0
  })
}

export default () =>
  describe('Survey Schema Summary', () => {
    gotoFormDesigner()

    const filePath = path.join(downloadsPath, 'schemaSummary.csv')
    let data = null

    test('export schema summary', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.waitForResponse(/.+\/schema-summary\//),
        page.click(getSelector(DataTestId.surveyForm.schemaSummary, 'button')),
      ])

      await download.saveAs(filePath)

      await expect(fs.existsSync(filePath)).toBeTruthy()
    })

    const nodeDefsOrderedByPath = getTestNodeDefsOrderedByPath()

    test(`Check generated schema summary`, async () => {
      await expect(fs.existsSync(filePath)).toBeTruthy()

      data = csv.parse(fs.readFileSync(filePath), {
        columns: true,
        skip_empty_lines: true,
      })

      await expect(data.length).toBe(nodeDefsOrderedByPath.length)
    })

    nodeDefsOrderedByPath.forEach((nodeDefItem, index) => {
      const { nodeDef, path: nodeDefPath } = nodeDefItem
      test(`Check ${nodeDef.name} def`, async () => {
        await expect(data).toBeDefined()
        const nodeDefData = data[index]
        await expect(Object.keys(nodeDefData)).toEqual([
          'uuid',
          'path',
          'type',
          'label_en',
          'label_fr',
          'key',
          'readOnly',
          'applyIf',
          'required',
          'validations',
        ])
        await expect(nodeDefData.uuid).toBeDefined()
        await expect(nodeDefData.path).toBe(nodeDefPath)
        await expect(nodeDefData.type).toBe(nodeDef.type)
        await expect(nodeDefData.label_en).toBe(nodeDef.label)
        await expect(nodeDefData.key).toBe(String(Boolean(nodeDef.key)))
      })
    })
  })