const mongoose = require('mongoose')
const { Schema } = mongoose
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    requried: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'viewer',
  },
  dob: {
    type: Date,
    requried: true,
  },
  profilePhoto: {
    type: String,
  },
})
const User = mongoose.model('user', UserSchema)
module.exports = User
