const express = require('express')
const router = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const SEC_KEY = process.env.SEC_KEY
const bcrypt = require('bcrypt')
const zod = require('zod')

const newSchema = zod.object({
  name: zod.string().min(3),
  email: zod.string().email().min(5),
  password: zod.string().min(5),
})
const schema = zod.object({
  email: zod.string().email().min(5),
  password: zod.string().min(5),
})

//Route to create a new User
router.post('/createUser', async (req, res) => {
  let success = false
  const { name, password, email, role } = req.body
  try {
    const validate = newSchema.safeParse(req.body)
    // console.log(validate)

    if (validate.success) {
      const user = await User.findOne({ email: email })
      if (user) {
        res
          .status(409)
          .json({ success: success, message: 'email already exists' })
      } else {
        const salt = await bcrypt.genSalt(10)
        const pass = await bcrypt.hash(password, salt)
        User.create({
          name: name,
          password: pass,
          email: email,
          role: role,
        }).then((result) => {
          // console.log(result.id)
          success = true
          const token = jwt.sign(
            { email: email, role: result.role, name: name, id: result.id },
            SEC_KEY
          )

          res.status(200).json({ success: success, token: token })
        })
      }
    } else {
      res.status(422).json({
        success: success,
        message: 'please enter values with proper values',
      })
    }
  } catch (error) {
    res.status(500).json({ success: success, message: error.message })
  }
})

// Route To login:
router.post('/login', async (req, res) => {
  let success = false
  try {
    const { email, password } = req.body
    const validate = schema.safeParse(req.body)
    if (validate.success) {
      const user = await User.findOne({ email: email })
      if (!user) {
        res.status(404).json({ success: success, message: 'User Not Found' })
      } else {
        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
          return res.status(400).json({
            success,
            error: 'Please try to login with correct credentials',
          })
        } else {
          const token = jwt.sign(
            { email: email, role: user.role, name: user.name, id: user.id },
            SEC_KEY
          )
          success = true
          res.status(200).json({ success: success, token: token })
        }
      }
    }
  } catch (error) {
    res.status(500).json({ success: success, message: error.message })
  }
})

// Route to update details
router.put('/updateUser/:id', async (req, res) => {
  const { name, oldPassword, newPassword } = req.body
  let success = false
  try {
    const user = await User.findById(req.params.id)
    if (user) {
      if (name) {
        User.findByIdAndUpdate(req.params.id, { name: name }).then((result) => {
          success = true
          const token = jwt.sign(
            {
              name: name,
              email: result.email,
              role: result.role,
              id: result.id,
            },
            SEC_KEY
          )
          res.status(200).json({
            success: success,
            token: token,
            message: 'Name updated successfully',
          })
        })
      } else {
        // console.log(oldPassword)
        const comparePass = await bcrypt.compare(oldPassword, user.password)
        const salt = await bcrypt.genSalt(10)
        const pass = await bcrypt.hash(newPassword, salt)
        if (comparePass) {
          User.findByIdAndUpdate(req.params.id, { password: pass }).then(
            (result) => {
              success = true
              const token = jwt.sign(
                {
                  name: name,
                  email: result.email,
                  role: result.role,
                  id: result.id,
                },
                SEC_KEY
              )
              res.status(200).json({
                success: success,
                token: token,
                message: 'Password updated successfully',
              })
            }
          )
        }
      }
    } else {
      res.status(404).json({ success: success, message: 'user not found' })
    }
  } catch (error) {
    res.status(500).json({ success: success, message: error.message })
  }
})

router.get('/getUser/:id', async (req, res) => {
  let success = false
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res
        .status(404)
        .json({ success: success, message: 'User not found' })
    }
    success = true
    return res.status(200).json({ success: success, user: user })
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})
module.exports = router
