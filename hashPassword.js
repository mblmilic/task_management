const bcrypt = require('bcryptjs');

const plainTextPassword = 'admin123';
const saltRounds = 10;

bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
});
