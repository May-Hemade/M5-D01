import express from "express"
import createHttpError from "http-errors"
import { basicAuthMiddleware } from "../auth/basic.js"
import AuthorsModel from "./schema.js"
import BlogModel from "../blogs/schema.js"
import { authenticateUser } from "../auth/tools.js"
import { JWTAuthMiddleware } from "../auth/token.js"
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

authorsRouter.post("/register", async (req, res, next) => {
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
    const author = await AuthorsModel.checkCredentials(email, password)
    if (author) {
      const accessToken = await authenticateUser(author)
      res.status(201).send({ accessToken })
    } else {
      next(createError(401, "not gonna happen"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/me/blogs", JWTAuthMiddleware, async (req, res, next) => {
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

authorsRouter.get("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
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

authorsRouter.put("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
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
  JWTAuthMiddleware,
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
