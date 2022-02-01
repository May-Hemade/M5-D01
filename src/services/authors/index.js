import express from "express"
import fs from "fs"
import { validationResult } from "express-validator"
import { newAuthorValidation } from "./validation.js"
import { fileURLToPath } from "url"
import { dirname, extname, join } from "path"
import { saveAuthorsAvatar } from "../../lib/fs-tools.js"

import multer from "multer"
import uniqid from "uniqid"

import { getAuthors, writeAuthors } from "../../lib/fs-tools.js"

const authorsRouter = express.Router()
authorsRouter.get("/", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors()
    res.send(authorsArray)
  } catch (error) {
    next(error)
  }
})
authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const authorsArray = await getAuthors()

    const foundAuthor = authorsArray.find((author) => author.ID === authorId)
    if (foundAuthor) {
      res.send(foundAuthor)
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      )
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post(
  "/",
  multer().single("avatar"),
  newAuthorValidation,
  async (req, res, next) => {
    try {
      console.log(req.file)
      const errorsList = validationResult(req)
      if (errorsList.isEmpty()) {
        const newAuthor = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          ID: uniqid(),
        }

        const authorsArray = await getAuthors()
        authorsArray.push(newAuthor)
        await writeAuthors(authorsArray)
        res.status(201).send({ ID: newAuthor.ID })
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
  }
)

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const authorsArray = await getAuthors()

    const index = authorsArray.findIndex((author) => author.ID === authorId)

    const oldAuthor = authorsArray[index]

    const updatedAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() }

    authorsArray[index] = updatedAuthor

    await writeAuthors(authorsArray)

    res.send(updatedAuthor)
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const authorsArray = await getAuthors()

    const remainingAuthors = authorsArray.filter(
      (author) => author.ID !== authorId
    )

    await writeAuthors(remainingAuthors)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors()
    const email = req.body.email
    console.log(email)
    const index = authorsArray.findIndex((author) => author.email == email)

    res.status(200).send({ exists: index >= 0 })
  } catch (error) {
    next(error)
  }
})

const upload = multer()

authorsRouter.post(
  "/:authorId/uploadAvatar",
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const authorId = req.params.authorId
      await saveAuthorsAvatar(`${authorId}.jpg`, req.file.buffer)
      const url = `http://localhost:3001/img/authors/${authorId}.extname`
      const authorsArray = await getAuthors()
      const index = authorsArray.findIndex((author) => author.ID === authorId)
      const oldAuthor = authorsArray[index]

      const updatedAuthor = { ...oldAuthor, avatar: url, updatedAt: new Date() }

      authorsArray[index] = updatedAuthor

      await writeAuthors(authorsArray)

      res.send(updatedAuthor)
    } catch (error) {
      next(error)
    }
  }
)
export default authorsRouter
