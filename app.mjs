import App from 'turbo-serv'

let app = new App()
let router = app.getRouter()

router.post('/', function () {
  let message = this.body.message
  this.res.send(message)
})

app.listen()
