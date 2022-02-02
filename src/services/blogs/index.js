import express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { newBlogValidation } from "./validation.js"
import { getBlogs, writeBlogs } from "../../lib/fs-tools.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"

import { v2 as cloudinary } from "cloudinary"

import { getPDFReadableStream } from "../../lib/pdf-tools.js"

import { pipeline } from "stream"

const blogsRouter = express.Router()

blogsRouter.post("/", newBlogValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      const newBlog = {
        ...req.body,
        createdAt: new Date(),
        id: uniqid(),
        readTime: { value: 1, unit: "minute" },
        author: {
          name: "May",
          avatar: "https://place-puppy.com/100x100",
        },
      }

      const blogsArray = await getBlogs()

      blogsArray.push(newBlog)

      await writeBlogs(blogsArray)

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

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogsArray = await getBlogs()
    res.send(blogsArray)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = await getBlogs()

    const foundBlog = blogsArray.find((blog) => blog.id == blogId)
    if (foundBlog) {
      res.send(foundBlog)
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = await getBlogs()

    const index = blogsArray.findIndex((blog) => blog.id === blogId)

    const oldBlog = blogsArray[index]

    const updatedBlog = { ...oldBlog, ...req.body, updatedAt: new Date() }

    blogsArray[index] = updatedBlog

    await writeBlogs(blogsArray)

    res.send(updatedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = await getBlogs()

    const remainingBlogs = blogsArray.filter((blog) => blog.id !== blogId)

    await writeBlogs(remainingBlogs)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "oct21",
    },
  }),
}).single("cover")

blogsRouter.post(
  "/:blogId/uploadCover",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const blogId = req.params.blogId
      // const extName = path.extname(req.file.originalname)
      // // const fileName = `${blogId}${extName}`
      // await saveBlogsCover(`${blogId}.${extName}`, req.file.buffer)
      // // const url = `http://localhost:3001/img/blogs/${blogId}.${extName}`
      const blogsArray = await getBlogs()
      const index = blogsArray.findIndex((blog) => blog.id === blogId)
      const oldBlog = blogsArray[index]

      const updatedBlog = {
        ...oldBlog,
        cover: req.file.path,
        updatedAt: new Date(),
      }

      blogsArray[index] = updatedBlog

      await writeBlogs(blogsArray)

      res.send(updatedBlog)
    } catch (error) {
      next(error)
    }
  }
)

blogsRouter.get("/:blogId/downloadPDF", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blogsArray = await getBlogs()
    const blog = blogsArray.find((blog) => blog.id === blogId)

    res.setHeader("Content-Disposition", `attachment; filename=${blogId}.pdf`)

    const source = getPDFReadableStream(blog)
    const destination = res
    pipeline(source, destination, (err) => {
      if (err) next(err)
    })
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
