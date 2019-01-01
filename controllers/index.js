const handleIndex = (req, res, db) =>
    db
        .select('*')
        .from('users')
        .then(users => {
            res.json(users)
        })
        .catch(err => res.status(400).json('No users found'))

module.exports = { handleIndex }
