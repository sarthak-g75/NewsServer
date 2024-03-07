const express = require('express')
const router = express.Router()
const Blog = require('../models/Blog')
const authMiddleware = require('../middlewares/auth')
const zod = require('zod')

const schema = zod.object({
  title: zod.string().min(5),
  description: zod.string().min(10),
})

//  API to get all blogs
router.get('/getAllBlogs', async (req, res) => {
  try {
    const blogs = await Blog.find({})
    res.status(200).json({ blogs: blogs })
    // next()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// API to create a blog
router.post('/createBlog', authMiddleware, async (req, res) => {
  let success = false
  if (req.userDetail.role === 'admin') {
    const validate = schema.safeParse(req.body)
    if (validate.success) {
      try {
        const { title, description } = req.body
        // const {i}
        await Blog.create({
          user: req.userDetail.id,
          title: title,
          description: description,
        })
        success = true
        res
          .status(200)
          .json({ success: success, message: 'blog added successfully' })
      } catch (error) {
        res.status(500).json({ success: success, message: error.message })
      }
    } else {
      res.json({
        success: success,
        message:
          'Title should contain atleast 5 characters and description should contain atleast 10 characters',
      })
    }
  } else {
    res.status(405).json({
      success: success,
      message: 'Only Admins are allowed to post blogs',
    })
  }
  // console.log(req.userDetail)
})

// API to get a particular Blog with blog id:
router.get('/getBlog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }
    return res.status(200).json({ success: true, blog: blog })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// API to get blogs of any ;
router.get('/getUserBlogs/:id', async (req, res) => {
  let success = false
  try {
    const blogs = await Blog.find({ user: req.params.id })

    // console.log(req.params.id)
    if (blogs.length > 0) {
      success = true
      return res.status(200).json({ success: success, blogs: blogs })
    } else {
      return res
        .status(404)
        .json({ success: success, message: 'No blogs found for this user' })
    }
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})

// Api to update the blog
router.put('/updateBlog/:id', authMiddleware, async (req, res) => {
  const { id } = req.userDetail
  const { title, description } = req.body
  try {
    const validate = schema.safeParse(req.body)
    if (!validate.success) {
      return res.status(405).json({
        success: false,
        message:
          'Please enter a title and description with a minimum of 5 characters each.',
      })
    }

    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    if (blog.user.toString() !== id) {
      return res
        .status(403)
        .json({ success: false, message: 'Not allowed to update' })
    }

    if (blog.title === title && blog.description === description) {
      return res.json({
        success: false,
        message: 'Please enter a new description and title to update',
      })
    }

    await Blog.findByIdAndUpdate(req.params.id, { title, description })
    return res
      .status(200)
      .json({ success: true, message: 'Blog updated successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// Api to delete the blog :
router.delete('/deleteBlog/:id', authMiddleware, async (req, res) => {
  let success = false
  const { id } = req.userDetail
  try {
    const blog = await Blog.findByIdAndDelete({ id: req.params.id, user: id })
    if (blog) {
      success = true
      return res
        .status(200)
        .json({ success: success, message: 'deleted successfully' })
    } else {
      const existingBlog = await Blog.findById(req.params.id)
      if (existingBlog) {
        return res
          .status(403)
          .json({ success, message: 'Not allowed to delete' })
      } else {
        return res.status(404).json({ success, message: 'Blog not found' })
      }
    }
  } catch (error) {
    return res.status(500).json({ success: success, message: error.message })
  }
})
module.exports = router
