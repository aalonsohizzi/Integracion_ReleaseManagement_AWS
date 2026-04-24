require('dotenv').config()

const { selectTable } = require('./dboperations')

let getUser = async (user, pass) => {
    let validUser = false

    await checkUser(user).then(response => {
        resp = response
    })

    if (resp.Item.password == pass  && resp.Item.username == user)
        validUser = true

    return validUser
}

let checkUser = async (user) => {
    let params = {
        TableName: 'usuarios',
        Key: {
            'username' : user
        }
    };

    await selectTable(params).then((responseData) => {
        resUser = responseData
    });

    return resUser
}

module.exports = { getUser }