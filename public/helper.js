function stringToArrayBuffer(str) {
  var arr = new Uint8Array(str.length);
  for (var i = str.length; i--;)
    arr[i] = str.charCodeAt(i);
  return arr.buffer;
}

function arrayBufferToString(buffer) {
  var arr = new Uint8Array(buffer);
  var str = String.fromCharCode.apply(String, arr);
  return str;
}

function keyPairToString(keyPair) {
  let obj = {
    pubKey: arrayBufferToString(keyPair.pubKey),
    privKey: arrayBufferToString(keyPair.privKey)
  }
  var str = JSON.stringify(obj)
  return str;
}

function stringToKeyPair(str) {
  let obj = JSON.parse(str)
  obj = {
    pubKey: stringToArrayBuffer(obj.pubKey),
    privKey: stringToArrayBuffer(obj.privKey)
  }
  return obj;
}