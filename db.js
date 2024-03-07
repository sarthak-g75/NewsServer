const mongoose = require('mongoose')
require('dotenv').config()
const uri = process.env.MONGO_URI
const connectToMongo = () => {
  mongoose
    .connect(uri, {
      dbName: 'NEWSAPP',
    })
    .then(() => {
      console.log('connected to mongo')
    })
    .catch((err) => {
      console.log(err.message)
    })
}
module.exports = connectToMongo
