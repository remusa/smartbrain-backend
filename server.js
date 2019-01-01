const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const knex = require('knex')
const bcrypt = require('bcrypt-nodejs')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgres',
        database: 'smartbrain',
    },
})

// db.select('*')
//     .from('users')
//     .then(data => {
//         console.log(data)
//     })

const saltRounds = 10

const app = express()

// const database = {
//     users: [
//         {
//             id: '123',
//             name: 'John',
//             email: 'john@gmail.com',
//             password: 'cookies',
//             entries: 0,
//             joined: new Date(),
//         },
//         {
//             id: '124',
//             name: 'Sally',
//             email: 'sally@gmail.com',
//             password: 'bananas',
//             entries: 0,
//             joined: new Date(),
//         },
//     ],
// }

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    // res.send(database.users)
})

app.post('/signin', (req, res) => {
    const { email, password } = req.body
    // if (
    //     req.body.email === database.users[0].email &&
    //     req.body.password === database.users[0].password
    // ) {
    //     res.json(database.users[0])
    // } else {
    //     res.status(400).json('error logging in')
    // }

    db.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash)

            if (isValid) {
                return db
                    .select('*')
                    .from('users')
                    .where('email', '=', email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('Unable to get user'))
            }

            res.status(400).json('Wrong credentials')
        })
        .catch(err => res.status(400).json('Error' + err))
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body

    // database.users.push({
    //     id: '125',
    //     name: name,
    //     email: email,
    //     password: password,
    //     entries: 0,
    //     joined: new Date(),
    // })

    const hash = bcrypt.hashSync(password)

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email,
        })
            .into('login')
            .returning('email')
            .then(
                loginEmail =>
                    trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0],
                            name: name,
                            joined: new Date(),
                        })
                        .then(user => {
                            res.json(user[0])
                        })
                // .catch(err => res.status(400).json('Unable to register'))
            )
            .then(trx.commit)
            .catch(trx.rollback)
    })

    // res.json(database.users[database.users.length - 1])
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params
    // const found = false

    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true
    //         return res.json(user)
    //     }
    // })

    db.select('*')
        .from('users')
        .where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('User not found')
            }
        })
        .catch(err => res.status(400).json('Error getting user: ' + err))

    // if (!found) {
    //     res.status(400).json('not found')
    // }
})

app.put('/image', (req, res) => {
    const { id } = req.body
    // let found = false

    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true
    //         user.entries++
    //         return res.json(user.entries)
    //     }
    // })

    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0]))
        .catch(err => res.status(400).json('Unable to get count'))

    // if (!found) {
    //     res.status(400).json('not found')
    // }
})

app.listen(3000, () => {
    console.log('app is running on port 3000')
})

/*
    /                   --> res = this is working
    /signin             --> POST = success/fail
    /register           --> POST = user
    /profile/:userID    --> GET = user
    /image              --> PUT = user
*/
