const SEC_KEY = process.env.SEC_KEY
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const fetchUser = async (req, res, next) => {
  const token = req.header('token')
  if (!token) {
    res.status(401).send('Please authenticate with the valid authentication')
  } else {
    const data = jwt.verify(token, SEC_KEY)
    //   console.log(data)
    const user = await User.findById(data.id)
    if (user) {
      req.userDetail = data
      //   console.log(req.userDetail)
      next()
    } else {
      res.status(404).send('User Not Found')
    }
  }
}

module.exports = fetchUser
