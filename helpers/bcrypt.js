const bcrypt = require('bcryptjs');

const hash = (password) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    return hash
}

const compare = (password, passwordHash) => {
    return bcrypt.compareSync(password, passwordHash);
}

module.exports = {
    compare, hash
}