const mongoose = require('mongoose')
const { Schema } = mongoose
const BlogSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})
const Blog = mongoose.model('Blog', BlogSchema)
module.exports = Blog
