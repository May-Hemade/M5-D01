import express from "express"
import createHttpError from "http-errors"
import { basicAuthMiddleware } from "../auth/basic.js"
import AuthorsModel from "./schema.js"
import BlogModel from "../blogs/schema.js"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body)
    const { _id } = await newAuthor.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    const itMatches = await AuthorsModel.checkCredentials(email, password)
    if (itMatches) {
      const token = Buffer.from(`${email}:${password}`).toString("base64")
      res.status(201).send({ token })
    } else {
      res.status(401).send("not gonna happen")
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/me/blogs", basicAuthMiddleware, async (req, res, next) => {
  try {
    const author = req.user
    const blogs = await BlogModel.find({ authors: author._id })
    res.send(blogs)
  } catch (error) {
    next(error)
  }
})

// authorsRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
//   try {
//     req.user.update({})
//      await req.user.save()

//     res.send()
//   } catch (error) {
//     next(error)
//   }
// })

authorsRouter.get("/:authorId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const author = await AuthorsModel.findById(authorId)
    if (author) {
      res.send(author)
    } else {
      next(createHttpError(404, `Author with id ${authorId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:authorId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const authorId = req.params.authorId
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      authorId,
      req.body,
      {
        new: true,
      }
    )
    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createHttpError(404, `Author with id ${authorId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete(
  "/:authorId",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const authorId = req.params.authorId
      const deletedAuthor = await AuthorsModel.findByIdAndDelete(authorId)
      if (deletedAuthor) {
        res.status(204).send()
      } else {
        next(createHttpError(404, `Author with id ${authorId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

export default authorsRouter
