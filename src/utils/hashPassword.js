const bcrypt = require('bcryptjs');

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(14, (err, salt) => {
            if (err) {
               return reject(err);
            }

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                 resolve(hash);
            })
        })
    })
}

module.exports = hashPassword;
