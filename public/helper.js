function stringToArrayBuffer(str) {
  return new Uint8Array(str.split(',').map(x => Number(x)))
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