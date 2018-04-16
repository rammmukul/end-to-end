function stringToArrayBuffer(str) {
  let arr = new Uint8Array(str.split(',').map(x => Number(x)))
  return arr.buffer
}

function arrayBufferToString(buffer) {
  let arr = new Uint8Array(buffer)
  return Array.from(arr).join()
}

function keyPairToString(keyPair) {
  let obj = {
    pubKey: arrayBufferToString(keyPair.pubKey),
    privKey: arrayBufferToString(keyPair.privKey)
  }
  let str = JSON.stringify(obj)
  return str
}

function stringToKeyPair(str) {
  let obj = JSON.parse(str)
  obj = {
    pubKey: stringToArrayBuffer(obj.pubKey),
    privKey: stringToArrayBuffer(obj.privKey)
  }
  return obj
}

function stringifyValues (obj) {
  if (typeof obj !== 'object') {
    return obj
  }
  if (obj instanceof ArrayBuffer) {
    return arrayBufferToString(obj)
  }
  let stringified = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof ArrayBuffer) {
      stringified[key] = arrayBufferToString(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      stringified[key] = stringifyValues(obj[key])
    } else {
      stringified[key] = obj[key]
    }
  })
  return stringified
}

function bufferise (obj) {
  if (typeof obj !== 'string') {
    return obj
  }
  obj = JSON.parse(obj)
  let bufferised = {}
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      bufferised[key] = stringToArrayBuffer(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      bufferised[key] = bufferise(obj[key])
    } else {
      bufferised[key] = obj[key]
    }
  })
  return bufferised
}
