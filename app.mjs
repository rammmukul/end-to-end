import App from 'turbo-serv'
import sqlite from 'sqlite3'

let app = new App()
let router = app.getRouter()
let db = new sqlite.Database(':memory:')

db.serialize(function () {
  db.run(`CREATE TABLE users (registrationId PRIMARY KEY,
                              pubSignedPreKey,
                              signKeyId,
                              signature,
                              identityKey)`)
  db.run(`CREATE TABLE preKeys (registrationId, keyId, pubPreKey)`)
})

router.post('/register', function () {
  console.log(this.body)
  let stmt = db.prepare(`INSERT INTO users VALUES ($registrationId,
    $pubSignedPreKey,
    $signKeyId,
    $signature,
    $identityKey)`)

  stmt.run({
    $registrationId: this.body.registrationId,
    $pubSignedPreKey: this.body.pubSignedPreKey,
    $signKeyId: this.body.signKeyId,
    $signature: this.body.signature,
    $identityKey: this.body.identityKey
  })
  stmt.finalize()

  let preStmt
  this.body.pubPreKeys.forEach(keyObj => {
    preStmt = db.prepare(`INSERT INTO preKeys VALUES ($registrationId, $keyId, $pubPreKey)`)
    preStmt.run({
      $registrationId: this.body.registrationId,
      $keyId: keyObj.keyId,
      $pubPreKey: keyObj.pubKey
    })
    preStmt.finalize()
  })

  db.each(`SELECT * FROM users`,
    (err, row) => {
      this.res.send(row || err)
    })
})

router.get('/users', function () {
  db.all(`SELECT * FROM users`,
    (err, row) => {
      let result = row
      this.res.send(result)
    })
})

router.post('/newSession', function () {
  console.log(this.body)
  let registrationId = this.body
  let stmt = db.prepare(`SELECT * FROM users NATURAL JOIN prekeys WHERE registrationId = $registrationId`)
  stmt.get({$registrationId: registrationId}, (err, row) => {
    console.log(row)
    this.res.send(row)
  })
})

app.listen()
