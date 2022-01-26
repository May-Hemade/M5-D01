import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import fs from "fs"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { newBlogValidation } from "./validation.js"

const blogsRouter = express.Router()

const blogsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogs.json"
)

const getBlogs = () => JSON.parse(fs.readFileSync(blogsJSONPath))
const writeBlogs = (content) =>
  fs.writeFileSync(blogsJSONPath, JSON.stringify(content))

blogsRouter.post("/", newBlogValidation, (req, res, next) => {
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      const newBlog = { ...req.body, createdAt: new Date(), id: uniqid() }

      const blogsArray = getBlogs()

      blogsArray.push(newBlog)

      writeBlogs(blogsArray)

      res.status(201).send({ id: newBlog.id })
    } else {
      next(
        createHttpError(400, "Some errors occurred in request body!", {
          errorsList,
        })
      )
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", (req, res, next) => {
  try {
    const blogsArray = getBlogs()
    res.send(blogsArray)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.bookId

    const blogsArray = getBlogs()

    const foundBlog = blogsArray.find((blog) => blog.id === blogId)
    if (foundBlog) {
      res.send(foundBlog)
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = getBlogs()

    const index = blogsArray.findIndex((blog) => blog.id === blogId)

    const oldBlog = blogsArray[index]

    const updatedBlog = { ...oldBlog, ...req.body, updatedAt: new Date() }

    blogsArray[index] = updatedBlog

    writeBlogs(blogsArray)

    res.send(updatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:blogId", (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = getBlogs()

    const remainingBlogs = blogsArray.filter((blog) => blog.id !== blogId)

    writeBlogs(remainingBlogs)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
