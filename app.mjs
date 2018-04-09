import App from 'turbo-serv'
import sqlite from 'sqlite3'

let app = new App()
let router = app.getRouter()
let db = new sqlite.Database(':memory:')

db.serialize(function () {
  db.run('CREATE TABLE clients (info TEXT)')
})

router.post('/', function () {
  console.log(this.body)
  var stmt = db.prepare('INSERT INTO clients VALUES (?)')
  stmt.run(JSON.stringify(this.body.registrationId))
  stmt.finalize()
  db.each('SELECT rowid AS id, info FROM clients', (err, row) => {
    console.log('db', row)
    console.log('app', row)
    this.res.send(row)
  })
})

app.listen()
