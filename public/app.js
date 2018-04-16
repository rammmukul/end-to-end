let signal = libsignal
let keyHelper = libsignal.KeyHelper
let store = new SignalProtocolStore()
let pubIdentityKey, pubSignedPreKey, signature
let pubPreKeys = []

async function init () {
  if (await store.getIdentityKeyPair() && await store.getLocalRegistrationId()) return null

  let registrationId = keyHelper.generateRegistrationId()
  localStorage.setItem('registrationId', registrationId)

  let identityKeyPair = await keyHelper.generateIdentityKeyPair()
  pubIdentityKey = arrayBufferToString(identityKeyPair.pubKey)
  store.put('identityKey', JSON.stringify(stringifyValues(identityKeyPair)))

  for (let i = 0; i < 5; i++) {
    let keyId = Math.ceil(Math.random() * 99999) //replace with uid
    let preKey = await keyHelper.generatePreKey(keyId)
    console.log(preKey)
    store.storePreKey(preKey.keyId, JSON.stringify(stringifyValues(preKey.keyPair)))
    pubPreKeys.push({
      keyId: keyId,
      pubKey: arrayBufferToString(preKey.keyPair.pubKey)
    })
  }

  let keyId = Math.ceil(Math.random() * 99999) //replace with uid
  let signedPreKey = await keyHelper.generateSignedPreKey(identityKeyPair, keyId)
  console.log(signedPreKey)
  let pubSignedPreKey = arrayBufferToString(signedPreKey.keyPair.pubKey)
  let signKeyId = signedPreKey.keyId
  let signature = arrayBufferToString(signedPreKey.signature)
  store.storeSignedPreKey(signedPreKey.keyId, JSON.stringify(stringifyValues(signedPreKey.keyPair)))

  let registrationData = {
    registrationId: registrationId,
    identityKey: pubIdentityKey,
    pubSignedPreKey: pubSignedPreKey,
    signKeyId: signKeyId,
    pubPreKeys: pubPreKeys,
    signature: signature
  }

  fetch('http://localhost:5000/register', {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(registrationData), // data can be `string` or {object}!
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(res => res.text())
    .catch(error => console.error('Error:', error))
    .then(response => console.log('Success:', response, response.length))
}

init().then(() => {
  let name = document.createElement('div')
  store.getLocalRegistrationId().then(res => {
    name.innerHTML = res
    document.getElementById('app').appendChild(name)
  })

  fetch('http://localhost:5000/users', {
      method: 'GET'
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
      console.log('Success:', response)
      let list = document.createElement('div')
      let userElement
      response.forEach(user => {
        userElement = document.createElement('div')
        userElement.innerText = user.registrationId
        userElement.onclick = () => openChat(user.registrationId)
        list.appendChild(userElement)
      })
      document.getElementById('app').appendChild(list)
    })
})

function openChat (registrationId) {
  let app = document.getElementById('app')
  app.innerHTML = ''
  window.recever = registrationId
  let input = document.createElement('input')
  input.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      console.log('>>>', window.recever)
      fetch('http://localhost:5000/newSession', {
          method: 'POST', // or 'PUT'
          body: JSON.stringify(window.recever), // data can be `string` or {object}!
          headers: new Headers({
            'Content-Type': 'application/json'
          })
      }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(res => {
          console.log(res)
          let address = new libsignal.SignalProtocolAddress(res.registrationId, res.registrationId)
          let sessionBuilder = new libsignal.SessionBuilder(store, address)
          let promise = sessionBuilder.processPreKey({
            registrationId: Number(res.registrationId),
            identityKey: stringToArrayBuffer(res.identityKey),
            signedPreKey: {
              keyId: Number(res.signKeyId),
              publicKey: stringToArrayBuffer(res.pubSignedPreKey),
              signature: stringToArrayBuffer(res.signature)
            },
            preKey: {
              keyId: Number(res.keyId),
              publicKey: stringToArrayBuffer(res.pubPreKey)
            }
          })

          promise.then(() => {
            // encrypt messages
            console.log('yahoooooooooooooo')
            let plaintext = "Hello world"
            let sessionCipher = new signal.SessionCipher(store, address)
            sessionCipher.encrypt(plaintext).then(function(ciphertext) {
                // ciphertext -> { type: <Number>, body: <string> }
                console.log(ciphertext.type, ciphertext.body)
            })
          })

          promise.catch(function onerror(error) {
            // handle identity key conflict
          })
        })
    }
  })
  app.appendChild(input)
}
