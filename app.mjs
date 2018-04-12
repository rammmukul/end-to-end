import App from 'turbo-serv'
import sqlite from 'sqlite3'

let app = new App()
let router = app.getRouter()
let db = new sqlite.Database(':memory:')

db.serialize(function () {
  db.run(`CREATE TABLE users (registrationId PRIMARY KEY,
                              pubSignedPreKey,
                              signature,
                              prekeys TEXT,
                              identityKey)`)
})

router.post('/', function () {
  console.log(this)
  //console.log(this.body)
  let stmt = db.prepare(`INSERT INTO users VALUES ($registrationId,
    $pubSignedPreKey,
    $signature,
    $prekeys,
    $identityKey)`)

  stmt.run({
    $registrationId: this.body.registrationId,
    $pubSignedPreKey: this.body.pubSignedPreKey,
    $signature: this.body.signature,
    //$prekeys: JSON.stringify(this.body.pubPreKeys),
    $identityKey: this.body.identityKey
  })
  stmt.finalize()

  db.each(`SELECT rowid AS id,
                          registrationId,
                          pubSignedPreKey,
                          signature,
                          identityKey
                        FROM users`, 
          (err, row) => {
    let result = JSON.stringify(row)
    console.log('db>>>', result)
    this.res.send(result)
  })
})

app.listen()
