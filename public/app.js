let keyHelper = libsignal.KeyHelper
let store = new SignalProtocolStore()
let registrationId = keyHelper.generateRegistrationId()

localStorage.setItem('registrationId', registrationId)
let pubIdentityKey, pubSignedPreKey, signature
let pubPreKeys = []

async function init() {
  let identityKeyPair = await keyHelper.generateIdentityKeyPair()
  console.log(identityKeyPair)
  pubIdentityKey = arrayBufferToString(identityKeyPair.pubKey)
  store.put('identityKey', keyPairToString(identityKeyPair))

  for (let i = 0; i < 100; i++) {
    let keyId = Math.floor(Math.random() * 99999) //replace with uid
    let preKey = await keyHelper.generatePreKey(keyId)
    console.log(preKey)
    store.storePreKey(preKey.keyId, keyPairToString(preKey.keyPair));
    pubPreKeys.push({
      keyId: keyId,
      pubKey: arrayBufferToString(preKey.keyPair.pubKey)
    })
  }
  
  let keyId = Math.floor(Math.random() * 99999) //replace with uid
  let signedPreKey = await keyHelper.generateSignedPreKey(identityKeyPair, keyId)
  console.log(signedPreKey)
  pubSignedPreKey = arrayBufferToString(signedPreKey.keyPair.pubKey)
  signature = arrayBufferToString(signedPreKey.signature)
  store.storeSignedPreKey(signedPreKey.keyId, keyPairToString(signedPreKey.keyPair));

  let registrationData = {
    registrationId: registrationId,
    identityKey: pubIdentityKey,
    pubSignedPreKey: pubSignedPreKey,
    //pubPreKeys: pubPreKeys,
    signature: signature
  }

  fetch('http://localhost:5000/', {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(registrationData), // data can be `string` or {object}!
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(res => res.text())
    .catch(error => console.error('Error:', error))
    .then(response => console.log('Success:', response, response.length))
}

init()