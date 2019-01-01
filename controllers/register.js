const handleRegister = (req, res, db, bcrypt) => {
    const { name, email, password } = req.body

    if (!email || !name || !password) {
        return res.status(400).json('Incorrect form submission')
    }

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
}

module.exports = { handleRegister }
