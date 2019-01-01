const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const knex = require('knex')
const bcrypt = require('bcrypt-nodejs')

const index = require('./controllers/index')
const signin = require('./controllers/signin')
const register = require('./controllers/register')
const profile = require('./controllers/profile')
const image = require('./controllers/image')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres',
        database: 'smartbrain',
    },
})

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    index.handleIndex(req, res, db)
})

app.post('/signin', signin.handleSignin(db, bcrypt))

app.post('/register', (req, res) => {
    register.handleRegister(req, res, db, bcrypt)
})

app.get('/profile/:id', (req, res) => {
    profile.handleProfile(req, res, db)
})

app.put('/image', (req, res) => {
    image.handleImage(req, res, db)
})

app.post('/imageurl', (req, res) => {
    image.handleApiCall(req, res)
})

// $env:PORT=3000

const PORT = process.env.PORT

// $env:DATABASE_URL=''
// const DATABASE_URL = process.env.DATABASE_URL

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`)
})

/*
    /                   --> res = this is working
    /signin             --> POST = success/fail
    /register           --> POST = user
    /profile/:userID    --> GET = user
    /image              --> PUT = user
*/
