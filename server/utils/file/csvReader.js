import { parse as csvParser } from 'csv'
import * as fs from 'fs'

import Queue from '@core/queue'

export const createReaderFromStream = (stream, onHeaders = null, onRow = null, onTotalChange = null) => {

  let canceled = false

  const start = () => new Promise((resolve, reject) => {
    const queue = new Queue()
    let headers = null
    let total = 0

    /**
     * Executes the specified function fn in a try catch.
     * Calls "reject" if the execution throws an error.
     */
    const _tryOrCancel = async fn => {
      try {
        await fn()
      } catch (e) {
        cancel()
        reject(e)
      }
    }

    const _indexRowByHeaders = row =>
      headers
        ? headers.reduce((accRow, header, index) => Object.assign(accRow, { [header]: row[index] }), {})
        : row

    const processNext = () => {
      (async () => {

        // run until there's a row in the queue and it's not been canceled
        for (let row = queue.dequeue(); !!row && !canceled; row = queue.dequeue()) {

          if (headers) {
            //headers have been read, process row
            if (onRow) {
              await _tryOrCancel(async () => {
                await onRow(_indexRowByHeaders(row))
              })
            }
          } else {
            //process headers
            headers = row
            if (onHeaders) {
              await _tryOrCancel(async () => {
                await onHeaders(headers)
              })
            }
          }
        }

        return resolve()
      })()
    }

    const onData = data => {
      if (canceled)
        return resolve()

      // skip first row (headers)
      if (total++ > 0)
        onTotalChange && onTotalChange(total)

      queue.enqueue(data)
    }

    const onEnd = () => {
      if (queue.isEmpty())
        resolve()
      else
        processNext()
    }

    stream
      .pipe(csvParser())
      .on('data', onData)
      .on('end', onEnd)
      .on('error', reject)
  })

  const cancel = () => {
    canceled = true
    stream && stream.destroy()
  }

  return { start, cancel }
}

export const createReaderFromFile = (filePath, onHeaders = null, onRow = null, onTotalChange = null) =>
  createReaderFromStream(fs.createReadStream(filePath), onHeaders, onRow, onTotalChange)

export const readHeadersFromStream = async stream => {
  let result = []

  const reader = createReaderFromStream(
    stream,
    headers => {
      reader.cancel()
      result = headers
    }
  )
  await reader.start()

  return result
}
