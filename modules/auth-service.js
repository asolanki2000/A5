// modules/auth-service.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

let User; // set after connection

function initialize() {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(process.env.MONGODB);
    db.on('error', (err) => reject(err));
    db.once('open', () => {
      User = db.model('users', userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      return reject('Passwords do not match');
    }

    bcrypt.hash(userData.password, 10)
      .then((hash) => {
        userData.password = hash;
        userData.loginHistory = [];
        const newUser = new User(userData);
        return newUser.save();
      })
      .then(() => resolve())
      .catch((err) => {
        if (err && err.code === 11000) return reject('User Name already taken');
        if (err && err.message && err.message.toLowerCase().includes('hash')) {
          return reject('There was an error encrypting the password');
        }
        return reject(`There was an error creating the user: ${err}`);
      });
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then(async (users) => {
        if (!users || users.length === 0) {
          return reject(`Unable to find user: ${userData.userName}`);
        }
        const user = users[0];

        const ok = await bcrypt.compare(userData.password, user.password);
        if (!ok) return reject(`Incorrect Password for user: ${userData.userName}`);

        // keep max 8 entries; newest at front
        if (user.loginHistory.length === 8) user.loginHistory.pop();
        user.loginHistory.unshift({
          dateTime: new Date(),
          userAgent: userData.userAgent || 'unknown'
        });

        return User.updateOne(
          { userName: user.userName },
          { $set: { loginHistory: user.loginHistory } }
        )
          .then(() => resolve(user))
          .catch((err) => reject(`There was an error verifying the user: ${err}`));
      })
      .catch(() => reject(`Unable to find user: ${userData.userName}`));
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser
};
