function stringToArrayBuffer(str) {
  str = unescape(atob(str))
  let arr = new Uint8Array(str.length)
  for (let i = str.length; i--;)
    arr[i] = str.charCodeAt(i)
  return arr.buffer
}

function arrayBufferToString(buffer) {
  console.log('buffff', btoa(buffer))
  let arr = new Uint8Array(buffer)
  let textDecoder = new TextDecoder('utf-8')
  //let str = String.fromCharCode(...arr)
  return btoa(escape(textDecoder.decode(arr)))
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