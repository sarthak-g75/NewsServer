const express = require('express')
const app = express()
const connectMongo = require('./db')
app.use(express.json())
require('dotenv').config()

connectMongo()
app.use('/api/auth', require('./routes/auth'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/news', require('./routes/news'))

app.listen(5000, () => {
  console.log(`app listening to http://localhost:5000`)
})
