import express from "express"
import createHttpError from "http-errors"
import BlogsModel from "./schema.js"

const blogsRouter = express.Router()

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body) // here happens validation of req.body, if it is not ok Mongoose will throw an error (if it is ok user it is not saved in db yet)
    const { _id } = await newBlog.save() // this is the line in which the interaction with Mongo happens (it is ASYNC!)
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find()
    res.send(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blog = await BlogsModel.findById(blogId)
    if (blog) {
      res.send(blog)
    } else {
      next(createHttpError(404, `Blog with id ${blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId
    const updatedBlog = await BlogsModel.findByIdAndUpdate(blogId, req.body, {
      new: true, // by default findByIdAndUpdate returns the record pre-modification, if you want to get back the newly updated record you should use the option new: true
    })
    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createHttpError(404, `Blog with id ${blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId
    const deletedBlog = await BlogsModel.findByIdAndDelete(blogId)
    if (deletedBlog) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `Blog with id ${blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
