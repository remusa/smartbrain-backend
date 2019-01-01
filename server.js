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

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

const db = knex({
    client: 'pg',
    connection: {
        connectionString: DATABASE_URL,
        ssl: true,
    },
})

const app = express()

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
    )
    next()
})

app.use(cors())
app.use(bodyParser.json())

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

app.listen(PORT || 3000, () => {
    console.log(`app is running on port ${PORT}`)
})

/*
    /                   --> res = this is working
    /signin             --> POST = success/fail
    /register           --> POST = user
    /profile/:userID    --> GET = user
    /image              --> PUT = user
*/
