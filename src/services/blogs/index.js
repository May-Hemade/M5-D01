import express from "express"
import createHttpError from "http-errors"
import BlogsModel from "./schema.js"
import { v4 as uniqId } from "uuid"
import q2m from "query-to-mongo"
import { blogAuthorMiddleware } from "../auth/author.js"

import { JWTAuthMiddleware } from "../auth/token.js"

const blogsRouter = express.Router()

blogsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body)
    const { _id } = await newBlog.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    console.log("QUERY ", req.query)
    console.log("QUERY-TO-MONGO: ", q2m(req.query))
    const mongoQuery = q2m(req.query)

    const { total, blogs } = await BlogsModel.findBlogsWithAuthors(mongoQuery)
    res.send({
      links: mongoQuery.links("/blogs", total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs,
    })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:blogId", async (req, res, next) => {
  try {
    const blogId = req.params.blogId

    const blog = await BlogsModel.findById(blogId).populate({
      path: "authors",
      select: "name avatar",
    })
    if (blog) {
      res.send(blog)
    } else {
      next(createHttpError(404, `Blog with id ${blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put(
  "/:blogId",
  JWTAuthMiddleware,
  blogAuthorMiddleware,
  async (req, res, next) => {
    try {
      const blogId = req.params.blogId
      const updatedBlog = await BlogsModel.findByIdAndUpdate(blogId, req.body, {
        new: true,
      })
      if (updatedBlog) {
        res.send(updatedBlog)
      } else {
        next(createHttpError(404, `Blog with id ${blogId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

blogsRouter.delete(
  "/:blogId",
  JWTAuthMiddleware,
  blogAuthorMiddleware,
  async (req, res, next) => {
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
  }
)

blogsRouter.post("/:blogId/comments", async (req, res, next) => {
  try {
    const commentToInsert = {
      ...req.body,
      _id: uniqId(),
    }
    const modifiedBlog = await BlogsModel.findByIdAndUpdate(
      req.params.blogId,
      { $push: { comments: commentToInsert } },
      { new: true }
    )

    if (modifiedBlog) {
      res.send(modifiedBlog)
    } else {
      next(createHttpError(404, `Blog with Id ${req.params.blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId)
    if (blog) {
      const comment = blog.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (comment) {
        res.send(comment)
      } else {
        next(
          createHttpError(
            404,
            `Comment with Id ${req.params.commentId} not found `
          )
        )
      }
    } else {
      next(createHttpError(404, `Blog with Id ${req.params.blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:blogId/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId)
    if (blog) {
      const index = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      )

      if (index !== -1) {
        blog.comments[index] = {
          ...blog.comments[index].toObject(),
          ...req.body,
        }

        await blog.save()
        res.send(blog)
      } else {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found!`
          )
        )
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete(
  "/:blogId/comments/:commentId",

  async (req, res, next) => {
    try {
      const modifiedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.blogId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      )
      if (modifiedBlog) {
        res.send(modifiedBlog)
      } else {
        next(
          createHttpError(404, `Blog with id ${req.params.blogId} not found!`)
        )
      }
    } catch (error) {
      next(error)
    }
  }
)

export default blogsRouter
