let keyHelper = libsignal.KeyHelper
let store = new SignalProtocolStore()
let pubIdentityKey, pubSignedPreKey, signature
let pubPreKeys = []

async function init() {
  if (await store.getIdentityKeyPair() && await store.getLocalRegistrationId()) {
    return
  }

  let registrationId = keyHelper.generateRegistrationId()
  localStorage.setItem('registrationId', registrationId)

  let identityKeyPair = await keyHelper.generateIdentityKeyPair()
  console.log(identityKeyPair)
  pubIdentityKey = arrayBufferToString(identityKeyPair.pubKey)
  store.put('identityKey', keyPairToString(identityKeyPair))

  for (let i = 0; i < 5; i++) {
    let keyId = Math.ceil(Math.random() * 99999) //replace with uid
    let preKey = await keyHelper.generatePreKey(keyId)
    console.log(preKey)
    store.storePreKey(preKey.keyId, keyPairToString(preKey.keyPair));
    pubPreKeys.push({
      keyId: keyId,
      pubKey: arrayBufferToString(preKey.keyPair.pubKey)
    })
  }

  let keyId = Math.ceil(Math.random() * 99999) //replace with uid
  let signedPreKey = await keyHelper.generateSignedPreKey(identityKeyPair, keyId)
  console.log(signedPreKey)
  pubSignedPreKey = arrayBufferToString(signedPreKey.keyPair.pubKey)
  signature = arrayBufferToString(signedPreKey.signature)
  store.storeSignedPreKey(signedPreKey.keyId, keyPairToString(signedPreKey.keyPair));

  let registrationData = {
    registrationId: registrationId,
    identityKey: pubIdentityKey,
    pubSignedPreKey: pubSignedPreKey,
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

function openChat(registrationId) {
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
        }).then(res => res.text())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response, response.length))
    }
  })
  app.appendChild(input)
}