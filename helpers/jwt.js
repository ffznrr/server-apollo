const jwt = require("jsonwebtoken")
const SECRET_KEY = process.env.SECRET_KEY

const sign = (password) => {
    return jwt.sign(password, SECRET_KEY)
}

const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY)
}

module.exports = { sign, verifyToken }