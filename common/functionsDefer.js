const debounceTimeouts = {}
const throttleTimeouts = {}
const throttleLastRan = {}

const debounce = (func, id, delay = 500, immediate = false) => {
  return function () {
    const context = this, args = arguments

    const later = function () {
      delete debounceTimeouts[id]
      if (!immediate)
        func.apply(context, args)
    }

    const callNow = immediate && !debounceTimeouts[id]
    clearTimeout(debounceTimeouts[id])
    debounceTimeouts[id] = setTimeout(later, delay)
    if (callNow)
      func.apply(context, args)
  }
}

const throttle = (func, id, limit = 500) => {
  return function () {
    const context = this
    const args = arguments

    const runFunction = () => {
      func.apply(context, args)
      throttleLastRan[id] = Date.now()
    }

    const lastRun = throttleLastRan[id]
    if (lastRun) {
      clearTimeout(throttleTimeouts[id])
      throttleTimeouts[id] = setTimeout(function () {
        if ((Date.now() - lastRun) >= limit) {
          runFunction()
        }
      }, limit - (Date.now() - lastRun))
    } else {
      runFunction()
    }
  }
}

module.exports = {
  throttle,
}